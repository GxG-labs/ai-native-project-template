import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,readFileSync,writeFileSync,rmSync,cpSync,mkdirSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
import {DatabaseSync} from 'node:sqlite';
const cli=resolve('dist/src/cycle/cli.js');
function command(args:string[]) {return spawnSync(process.execPath,[cli,...args],{encoding:'utf8'});}
function setup(t:any){const dir=mkdtempSync(join(tmpdir(),'cycle-test-'));t.after(()=>rmSync(dir,{recursive:true,force:true}));return dir;}
test('standalone CLI resumes every committed phase, repairs rejected plans and reassesses without repeating actions',t=>{
 const root=setup(t),run=join(root,'run');
 let r=command(['init','--run',run,'--demo']);assert.equal(r.status,0,r.stderr);
 const db=new DatabaseSync(join(run,'memory.sqlite'));t.after(()=>db.close());
 const step=()=>{const p=command(['step','--run',run]);assert.equal(p.status,0,p.stderr);return JSON.parse(p.stdout);};
 step(); // plan
 step(); // act: evidence persisted
 step(); // assess
 const feedback=join(root,'feedback.json');writeFileSync(feedback,JSON.stringify({criteria:'Accept only items containing the word blue.',reason:'Human narrows acceptance.'}));
 r=command(['feedback','--run',run,'--file',feedback]);assert.equal(r.status,0,r.stderr);
 for(let i=0;i<60;i++){const s=step();if(s.status==='complete')break;assert.notEqual(s.status,'needs_input',JSON.stringify(s));}
 const status=JSON.parse(command(['status','--run',run]).stdout);
 assert.equal(status.status,'complete');assert.equal(status.accepted,2);
 assert.equal(db.prepare("SELECT count(*) n FROM steps WHERE phase='act'").get()!.n,3);
 assert.equal(db.prepare('SELECT count(*) n FROM results').get()!.n,3);
 assert.ok(Number(db.prepare('SELECT count(*) n FROM ratings').get()!.n)>=3);
 assert.ok(Number(db.prepare('SELECT count(*) n FROM feedback').get()!.n)>=1);
 assert.equal(db.prepare("SELECT count(*) n FROM results WHERE revision<2 AND human=0").get()!.n,0);
});
test('a copied template launches without a chat and retains rejected results',t=>{
 const root=setup(t),run=join(root,'run');
 const init=command(['init','--run',run,'--demo']);assert.equal(init.status,0,init.stderr);
 const result=command(['run','--run',run]);assert.equal(result.status,0,result.stderr);
 const status=JSON.parse(result.stdout);assert.equal(status.status,'complete');assert.equal(status.accepted,2);
});

function fixture(run:string,body:string,settings:Record<string,unknown>={}){
 writeFileSync(join(run,'fixture.mjs'),body);
 const db=new DatabaseSync(join(run,'memory.sqlite'));
 const config=JSON.parse(String(db.prepare("SELECT value FROM kv WHERE key='config'").get()!.value));
 Object.assign(config,{adapter:[process.execPath,'fixture.mjs'],retryDelayMs:0},settings);
 db.prepare("UPDATE kv SET value=? WHERE key='config'").run(JSON.stringify(config));db.close();
}
const protocol=`
import {appendFileSync,readFileSync,existsSync} from 'node:fs';
let raw='';for await(const chunk of process.stdin)raw+=chunk;const c=JSON.parse(raw);
const past=existsSync('requests.jsonl')?readFileSync('requests.jsonl','utf8').trim().split('\\n').map(JSON.parse):[];
appendFileSync('requests.jsonl',JSON.stringify(c)+'\\n');
const send=x=>console.log(JSON.stringify(x));
`;
const normal=`
if(c.phase==='plan'){const n=c.recentActions.length;send({action:{key:'item-'+n,tool:'read-sample',input:{n}},reason:'Choose a fresh item'});}
else if(c.phase==='act')send({id:c.action.key,evidence:'Local fixture verified',value:{n:c.action.input.n}});
else if(c.phase==='assess'||c.phase==='review')send({accepted:!c.criteria.includes('reject')||c.item.value.n>0,reason:'Actual item checked'});
else send({observation:'Checked item '+c.item.id,next:'Continue with fresh evidence',methodDecision:'revert',reason:'Three passes show this instruction adds no useful behavior'});
`;
test('duplicate plan and transient action error receive persisted feedback and recover without counting access as rejection',t=>{
 const run=join(setup(t),'run');assert.equal(command(['init','--run',run,'--demo']).status,0);
 fixture(run,protocol+`
if(c.phase==='plan'&&c.recentActions.length===1&&!c.retry){send({action:{key:'item-0',tool:'read-sample',input:{n:0}},reason:'Repeated plan'});}
else if(c.phase==='act'&&c.action.key==='item-1'&&!past.some(p=>p.phase==='act'&&p.action.key==='item-1'))send({error:{kind:'transient',reason:'Temporary tool outage'}});
else {${normal}}
`);
 const result=command(['run','--run',run]);assert.equal(result.status,0,result.stderr);assert.equal(JSON.parse(result.stdout).status,'complete');
 const db=new DatabaseSync(join(run,'memory.sqlite'));t.after(()=>db.close());
 assert.equal(db.prepare('SELECT count(*) n FROM results').get()!.n,2);
 assert.equal(db.prepare("SELECT count(*) n FROM steps WHERE phase='failure'").get()!.n,2);
 const plans=db.prepare("SELECT input FROM attempts WHERE phase='plan'").all().map(r=>JSON.parse(String(r.input)));
 assert.ok(plans.some(p=>p.retry?.rejected?.action.key==='item-0'&&p.retry.reason.includes('already completed')));
 assert.equal(db.prepare('SELECT count(*) n FROM results WHERE accepted=0').get()!.n,0);
});
test('three unsuccessful retries require human action and resume cannot reset the global call budget',t=>{
 const run=join(setup(t),'run');command(['init','--run',run,'--demo']);
 fixture(run,protocol+`send({error:{kind:'transient',reason:'Unavailable'}});`,{maxCalls:3});
 let r=command(['run','--run',run]);assert.equal(r.status,2);assert.equal(JSON.parse(r.stdout).calls,3);
 r=command(['resume','--run',run]);assert.equal(r.status,2);assert.equal(JSON.parse(r.stdout).calls,3);
});
test('failed checkpoint rolls back result and next step, then a new process reuses saved external response',t=>{
 const run=join(setup(t),'run');command(['init','--run',run,'--demo']);fixture(run,protocol+normal);
 command(['step','--run',run]);
 const db=new DatabaseSync(join(run,'memory.sqlite'));t.after(()=>db.close());
 db.exec("CREATE TRIGGER reject_result BEFORE INSERT ON results BEGIN SELECT RAISE(ABORT,'injected storage failure'); END");
 assert.equal(command(['step','--run',run]).status,1);
 assert.equal(db.prepare('SELECT count(*) n FROM results').get()!.n,0);
 assert.equal(JSON.parse(String(db.prepare("SELECT value FROM kv WHERE key='state'").get()!.value)).phase,'act');
 db.exec('DROP TRIGGER reject_result');assert.equal(command(['step','--run',run]).status,0);
 const requests=readFileSync(join(run,'requests.jsonl'),'utf8').trim().split('\n').map(x=>JSON.parse(x));
 assert.equal(requests.filter(x=>x.phase==='act').length,1);
 assert.equal(db.prepare('SELECT count(*) n FROM results').get()!.n,1);
});
test('human criteria correction after completion reopens review and overrides survive machine reassessment',t=>{
 const root=setup(t),run=join(root,'run');command(['init','--run',run,'--demo']);fixture(run,protocol+normal);
 assert.equal(command(['run','--run',run]).status,0);
 const file=join(root,'feedback.json');writeFileSync(file,JSON.stringify({criteria:'reject item zero',reason:'Human correction',ratings:[{id:'item-1',accepted:false,reason:'Explicit exclusion'}]}));
 assert.equal(command(['feedback','--run',run,'--file',file]).status,0);
 assert.equal(command(['run','--run',run]).status,0);
 const db=new DatabaseSync(join(run,'memory.sqlite'));t.after(()=>db.close());
 assert.equal(db.prepare("SELECT accepted FROM results WHERE id='item-0'").get()!.accepted,0);
 assert.equal(db.prepare("SELECT accepted FROM results WHERE id='item-1'").get()!.accepted,0);
 assert.equal(db.prepare('SELECT count(*) n FROM results').get()!.n,4);
 assert.equal(db.prepare("SELECT count(*) n FROM steps WHERE phase='act'").get()!.n,4);
 assert.equal(db.prepare("SELECT count(*) n FROM ratings WHERE result_id='item-0'").get()!.n,2);
 const plans=db.prepare("SELECT input FROM attempts WHERE phase='plan' ORDER BY id DESC LIMIT 1").get()!;
 assert.ok(JSON.parse(String(plans.input)).observations.every((o:any)=>!['item-0','item-1'].includes(o.resultId)||o.accepted===0));
});
test('method trial is reverted only after three completed passes, retaining its history',t=>{
 const root=setup(t),run=join(root,'run');command(['init','--run',run,'--demo']);fixture(run,protocol+normal,{target:4});
 const file=join(root,'method.json');writeFileSync(file,JSON.stringify({instruction:'Try one alternative action-selection rule.',reason:'Human changes approach'}));
 assert.equal(command(['method','--run',run,'--file',file]).status,0);
 for(let i=0;i<10;i++)assert.equal(command(['step','--run',run]).status,0);
 const db=new DatabaseSync(join(run,'memory.sqlite'));t.after(()=>db.close());
 assert.equal(db.prepare('SELECT status FROM methods WHERE id=2').get()!.status,'trial');
 assert.equal(command(['run','--run',run]).status,0);
 assert.equal(db.prepare('SELECT status FROM methods WHERE id=2').get()!.status,'reverted');
 assert.equal(db.prepare('SELECT passes FROM methods WHERE id=2').get()!.passes,3);
 assert.equal(db.prepare("SELECT value FROM kv WHERE key='method'").get()!.value,'1');
});

test('human feedback during an external assessment discards its stale answer before saving',async t=>{
 const {spawn}=await import('node:child_process');
 const {existsSync}=await import('node:fs');
 const {setTimeout:delay}=await import('node:timers/promises');
 const root=setup(t),run=join(root,'run');command(['init','--run',run,'--demo']);
 fixture(run,protocol+`
if(c.phase==='assess'&&!existsSync('release')){
 appendFileSync('waiting','ready');while(!existsSync('release'))await new Promise(r=>setTimeout(r,20));
 send({accepted:true,reason:'Old criteria answer'});
}else {${normal}}
`);
 command(['step','--run',run]);command(['step','--run',run]);
 const child=spawn(process.execPath,[cli,'step','--run',run],{stdio:['ignore','pipe','pipe']});
 t.after(()=>child.kill('SIGKILL'));
 const done=new Promise<number|null>(resolve=>child.on('exit',resolve));
 for(let i=0;i<100&&!existsSync(join(run,'waiting'));i++)await delay(20);
 assert.ok(existsSync(join(run,'waiting')));
 const file=join(root,'feedback.json');writeFileSync(file,JSON.stringify({criteria:'reject item zero',reason:'Correction while model is in flight'}));
 assert.equal(command(['feedback','--run',run,'--file',file]).status,0);
 writeFileSync(join(run,'release'),'go');assert.equal(await done,0);
 const db=new DatabaseSync(join(run,'memory.sqlite'));t.after(()=>db.close());
 assert.equal(db.prepare('SELECT count(*) n FROM ratings').get()!.n,0);
 assert.equal(db.prepare("SELECT count(*) n FROM steps WHERE phase='superseded'").get()!.n,1);
 command(['step','--run',run]);command(['step','--run',run]);
 assert.equal(db.prepare("SELECT accepted FROM results WHERE id='item-0'").get()!.accepted,0);
});
test('transient tool failure does not advance the method trial pass counter',t=>{
 const root=setup(t),run=join(root,'run');command(['init','--run',run,'--demo']);
 fixture(run,protocol+`if(c.phase==='act'&&!past.some(p=>p.phase==='act'))send({error:{kind:'transient',reason:'Connection unavailable'}});else {${normal}}`,{target:4});
 const file=join(root,'method.json');writeFileSync(file,JSON.stringify({instruction:'Try a new selection rule',reason:'Human trial'}));command(['method','--run',run,'--file',file]);
 const result=command(['run','--run',run]);assert.equal(result.status,0,result.stderr);
 const db=new DatabaseSync(join(run,'memory.sqlite'));t.after(()=>db.close());
 assert.equal(db.prepare('SELECT passes FROM methods WHERE id=2').get()!.passes,3);
 assert.equal(db.prepare("SELECT count(*) n FROM steps WHERE phase='observe'").get()!.n,4);
});

test('feedback at the review commit boundary cannot be overwritten by a machine answer',async t=>{
 const {Cycle}=await import('../src/cycle/runtime.js');
 const root=setup(t),run=join(root,'run');command(['init','--run',run,'--demo']);fixture(run,protocol+normal);
 command(['run','--run',run]);
 const cycle=new Cycle(run);t.after(()=>cycle.close());
 cycle.feedback({criteria:'Accept evidence-backed items under revised criteria',reason:'Review all'});
 const commit=cycle.checkpoint.bind(cycle);
 cycle.checkpoint=(...args:Parameters<typeof commit>)=>{
  if(args[1]==='review'){
   const other=new Cycle(run);other.feedback({reason:'Human exclusion at boundary',ratings:[{id:'item-0',accepted:false,reason:'Human reviewed this item'}]});other.close();
  }
  return commit(...args);
 };
 await cycle.step();
 const row=cycle.db.prepare("SELECT accepted,human FROM results WHERE id='item-0'").get()!;
 assert.equal(row.accepted,0);assert.equal(row.human,1);
});
test('an instruction introduced after the action cannot claim that iteration as a trial pass',t=>{
 const root=setup(t),run=join(root,'run');command(['init','--run',run,'--demo']);fixture(run,protocol+normal);
 command(['step','--run',run]);command(['step','--run',run]);
 const file=join(root,'method.json');writeFileSync(file,JSON.stringify({instruction:'New selection method',reason:'Human change'}));command(['method','--run',run,'--file',file]);
 for(let i=0;i<3;i++)command(['step','--run',run]);
 const db=new DatabaseSync(join(run,'memory.sqlite'));t.after(()=>db.close());
 assert.equal(db.prepare('SELECT passes FROM methods WHERE id=2').get()!.passes,0);
});
test('successful steps reset consecutive failures while the total call budget still applies',t=>{
 const run=join(setup(t),'run');command(['init','--run',run,'--demo']);
 fixture(run,protocol+`if(['plan','act','assess'].includes(c.phase)&&!past.some(p=>p.phase===c.phase))send({error:{kind:'transient',reason:'Temporary failure at '+c.phase}});else {${normal}}`);
 const r=command(['run','--run',run]);assert.equal(r.status,0,r.stderr);assert.equal(JSON.parse(r.stdout).status,'complete');
});

test('each run has fresh independent memory even when the template contains a database',t=>{
 const root=setup(t),template=join(root,'template'),first=join(root,'first'),second=join(root,'second');
 assert.equal(command(['init','--run',template,'--demo']).status,0);
 assert.equal(command(['run','--run',template]).status,0);
 for(const run of [first,second]){
  const r=command(['init','--run',run,'--template',template]);
  assert.equal(r.status,0,r.stderr);
  assert.equal(JSON.parse(r.stdout).accepted,0);
 }
 assert.equal(command(['run','--run',first]).status,0);
 const a=JSON.parse(command(['status','--run',first]).stdout);
 const b=JSON.parse(command(['status','--run',second]).stdout);
 const original=JSON.parse(command(['status','--run',template]).stdout);
 assert.equal(a.accepted,2);assert.equal(b.accepted,0);assert.equal(b.calls,0);assert.equal(original.accepted,2);
});

test('SIGTERM pauses a live child and a fresh process resumes without repeating the saved action',async t=>{
 const {spawn}=await import('node:child_process');
 const {existsSync}=await import('node:fs');
 const {setTimeout:delay}=await import('node:timers/promises');
 const run=join(setup(t),'run');command(['init','--run',run,'--demo']);
 fixture(run,protocol+`
if(c.phase==='assess'&&!existsSync('release')){
 appendFileSync('waiting','ready');await new Promise(r=>setTimeout(r,60000));
}else {${normal}}
`);
 const child=spawn(process.execPath,[cli,'run','--run',run],{stdio:'ignore'});
 t.after(()=>child.kill('SIGKILL'));
 const done=new Promise<number|null>(resolve=>child.on('exit',resolve));
 for(let i=0;i<150&&!existsSync(join(run,'waiting'));i++)await delay(20);
 assert.ok(existsSync(join(run,'waiting')));
 child.kill('SIGTERM');assert.equal(await done,0);
 const status=JSON.parse(command(['status','--run',run]).stdout);assert.equal(status.status,'paused');
 writeFileSync(join(run,'release'),'continue');
 const resumed=command(['resume','--run',run]);assert.equal(resumed.status,0,resumed.stderr);
 assert.equal(JSON.parse(resumed.stdout).status,'complete');
 const requests=readFileSync(join(run,'requests.jsonl'),'utf8').trim().split('\n').map(x=>JSON.parse(x));
 assert.equal(requests.filter(x=>x.phase==='act'&&x.action.key==='item-0').length,1);
 const db=new DatabaseSync(join(run,'memory.sqlite'));t.after(()=>db.close());
 assert.equal(db.prepare('SELECT count(*) n FROM results').get()!.n,2);
});


test('template schema and transactional run migrations preserve results and apply only once',t=>{
 const root=setup(t),template=join(root,'template'),run=join(root,'run'),other=join(root,'other');
 cpSync('templates/self-improving-loop',template,{recursive:true});
 const schema=join(template,'schema.sql');
 writeFileSync(schema,readFileSync(schema,'utf8')+'\nCREATE TABLE custom_seed(value TEXT);\n');
 mkdirSync(join(template,'migrations'));
 writeFileSync(join(template,'migrations','001-details.sql'),'ALTER TABLE results ADD COLUMN detail TEXT; ALTER TABLE actions ADD COLUMN note TEXT; ALTER TABLE kv ADD COLUMN note TEXT; ALTER TABLE lock ADD COLUMN note TEXT;');
 let r=command(['init','--run',run,'--template',template,'--demo']);assert.equal(r.status,0,r.stderr);
 assert.equal(command(['run','--run',run]).status,0);
 const db=new DatabaseSync(join(run,'memory.sqlite'));t.after(()=>db.close());
 assert.equal(db.prepare('SELECT count(*) n FROM custom_seed').get()!.n,0);
 assert.ok(db.prepare('PRAGMA table_info(results)').all().some(x=>x.name==='detail'));
 const file=join(run,'migrations','002-notes.sql');
 writeFileSync(file,"CREATE TABLE notes(value TEXT); INSERT INTO notes VALUES('kept');");
 db.prepare('INSERT INTO lock(id,pid) VALUES(1,?)').run(process.pid);
 r=command(['migrate','--run',run]);assert.equal(r.status,1);assert.match(r.stderr,/Runner already active/);
 db.prepare('DELETE FROM lock WHERE id=1').run();
 for(let i=0;i<2;i++){r=command(['migrate','--run',run]);assert.equal(r.status,0,r.stderr);}
 assert.equal(db.prepare('SELECT count(*) n FROM notes').get()!.n,1);
 assert.equal(db.prepare('SELECT count(*) n FROM results').get()!.n,2);
 assert.equal(db.prepare('SELECT count(*) n FROM migrations').get()!.n,2);
 writeFileSync(join(run,'migrations','003-broken.sql'),'ALTER TABLE results ADD COLUMN partial TEXT; INVALID SQL;');
 r=command(['migrate','--run',run]);assert.equal(r.status,1);
 assert.ok(!db.prepare('PRAGMA table_info(results)').all().some(x=>x.name==='partial'));
 assert.equal(db.prepare('SELECT count(*) n FROM migrations').get()!.n,2);
 rmSync(join(run,'migrations','003-broken.sql'));
 writeFileSync(file,'CREATE TABLE changed(value TEXT);');
 r=command(['migrate','--run',run]);assert.equal(r.status,1);assert.match(r.stderr,/changed/i);
 assert.equal(command(['init','--run',other,'--template',template,'--demo']).status,0);
 const second=new DatabaseSync(join(other,'memory.sqlite'));t.after(()=>second.close());
 assert.equal(second.prepare('SELECT count(*) n FROM results').get()!.n,0);
 assert.equal(second.prepare("SELECT count(*) n FROM sqlite_master WHERE name='notes'").get()!.n,0);
});
