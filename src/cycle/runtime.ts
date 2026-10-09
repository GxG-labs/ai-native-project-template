import {DatabaseSync} from 'node:sqlite';
import {join} from 'node:path';
import {existsSync,readFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {Ajv} from 'ajv';
import {command,OperationError} from './command.js';

export type Config={task:string;criteria:string;method:string;target:number;tools:string[];adapter:string[];maxCalls:number;maxIterations:number;maxFailures:number;noProgress:number;timeoutSeconds:number;retryDelayMs:number};
type State={status:string;phase:string;iteration:number;calls:number;failures:number;empty:number;actionMethod?:number;action?:any;item?:any;assessment?:any;assessmentRevision?:number;assessmentMethod?:number;retry?:any;nextAt?:number;reason?:string};
const str={type:'string',minLength:1,maxLength:8000};
const object=(properties:any)=>({type:'object',properties,required:Object.keys(properties),additionalProperties:false});
export const schemas:Record<string,any>={
 plan:object({action:object({key:{...str,maxLength:200},tool:{...str,maxLength:100},input:{type:'object'}}),reason:str}),
 act:object({id:{...str,maxLength:200},evidence:str,value:{}}),
 assess:object({accepted:{type:'boolean'},reason:str}),
 observe:object({observation:str,next:str,methodDecision:{enum:['keep','revert','pending']},reason:str}),
};
const ajv=new Ajv();const validators=Object.fromEntries(Object.entries(schemas).map(([k,s])=>[k,ajv.compile(s)]));
function check(kind:string,value:any){if(!validators[kind](value))throw new OperationError('invalid',`Invalid ${kind} output: ${ajv.errorsText(validators[kind].errors)}`);return value;}
function text(value:unknown,name:string,max=8000):asserts value is string {if(typeof value!=='string'||!value.trim()||value.length>max)throw Error(`${name} must be nonempty text up to ${max} characters`);}
export function validateConfig(c:Config){
 for(const k of ['task','criteria','method'] as const)text(c[k],k);
 for(const k of ['target','maxCalls','maxIterations','maxFailures','noProgress','timeoutSeconds'] as const)if(!Number.isSafeInteger(c[k])||c[k]<1)throw Error(`Invalid ${k}`);
 if(!Number.isSafeInteger(c.retryDelayMs)||c.retryDelayMs<0)throw Error('Invalid retryDelayMs');
 for(const k of ['tools','adapter'] as const){if(!Array.isArray(c[k])||!c[k].length)throw Error(`Missing ${k}`);for(const x of c[k])text(x,k,2000);}
}
export class Cycle {
 db:DatabaseSync;
 constructor(public dir:string,public signal=new AbortController().signal){
  this.db=new DatabaseSync(join(dir,'memory.sqlite'));this.db.exec('PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000; PRAGMA foreign_keys=ON;');

 }
 tx<T>(f:()=>T):T {this.db.exec('BEGIN IMMEDIATE');try{const x=f();this.db.exec('COMMIT');return x;}catch(e){this.db.exec('ROLLBACK');throw e;}}
 get<T=any>(key:string):T {const r=this.db.prepare('SELECT value FROM kv WHERE key=?').get(key);return r?JSON.parse(String(r.value)):undefined as T;}
 set(key:string,value:any){this.db.prepare('INSERT INTO kv(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value').run(key,JSON.stringify(value));}
 initialize(c:Config){validateConfig(c);const schema=readFileSync(join(this.dir,'schema.sql'),'utf8');this.tx(()=>{
 this.db.exec(schema);if(this.get('config'))throw Error('Run already initialized');
 this.set('config',c);this.set('revision',1);this.set('method',1);this.set('evaluationRevision',1);
 this.set('state',{status:'ready',phase:'plan',iteration:1,calls:0,failures:0,empty:0});
 this.db.prepare('INSERT INTO criteria_versions(id,text,reason) VALUES(1,?,?)').run(c.criteria,'Initial human criteria');
 this.db.prepare('INSERT INTO methods(id,instruction,parent,status,reason,passes) VALUES(1,?,NULL,?,?,0)').run(c.method,'active','Initial method');
 });}
 migrate(){
  const folder=join(this.dir,'migrations');
  const files=existsSync(folder)?readdirSync(folder).filter(x=>x.endsWith('.sql')).sort():[];
  this.tx(()=>{
   this.db.exec('CREATE TABLE IF NOT EXISTS migrations(name TEXT PRIMARY KEY, checksum TEXT NOT NULL, applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)');
   const applied=this.db.prepare('SELECT name,checksum FROM migrations ORDER BY name').all();
   for(const row of applied)if(!files.includes(String(row.name)))throw Error('Applied migration missing: '+row.name);
   for(const name of files){
    if(!/^\d{3,}-[a-z0-9-]+\.sql$/.test(name))throw Error('Use numbered migration names, e.g. 001-details.sql');
    const sql=readFileSync(join(folder,name),'utf8');
    const checksum=createHash('sha256').update(sql).digest('hex');
    const previous=applied.find(x=>x.name===name);
    if(previous){if(previous.checksum!==checksum)throw Error('Applied migration changed: '+name);continue;}
    if(applied.some(x=>String(x.name)>name))throw Error('New migrations must follow applied migrations: '+name);
    // Migration scripts are trusted code, but transaction boundaries belong to the runner.
    const statements=sql.replace(/--[^\n]*|\/\*[\s\S]*?\*\//g,'');
    if(/(?:^|;)\s*(?:BEGIN|COMMIT|END|ROLLBACK|SAVEPOINT|RELEASE|VACUUM|ATTACH|DETACH|PRAGMA)\b/i.test(statements))throw Error('Migration cannot control transactions or database connections: '+name);
    this.db.exec(sql);
    this.db.prepare('INSERT INTO migrations(name,checksum) VALUES(?,?)').run(name,checksum);
   }
  });
 }
 config(){return this.get<Config>('config');}
 state(){return this.get<State>('state');}
 revision(){return this.get<number>('revision');}
 criteria(){return String(this.db.prepare('SELECT text FROM criteria_versions WHERE id=?').get(this.revision())!.text);}
 method(){return this.db.prepare('SELECT * FROM methods WHERE id=?').get(this.get<number>('method'))!;}
 accepted(){return Number(this.db.prepare('SELECT count(*) n FROM results WHERE accepted=1 AND (revision=? OR human=1)').get(this.revision())!.n);}
 stale(){return this.db.prepare('SELECT * FROM results WHERE accepted IS NOT NULL AND revision<? AND human=0 ORDER BY id LIMIT 1').get(this.revision());}
 status(){return {...this.state(),accepted:this.accepted(),target:this.config().target,pendingReview:Number(this.db.prepare('SELECT count(*) n FROM results WHERE accepted IS NOT NULL AND revision<? AND human=0').get(this.revision())!.n),revision:this.revision()};}
 lock(){this.tx(()=>{const r=this.db.prepare('SELECT pid FROM lock WHERE id=1').get();if(r){try{process.kill(Number(r.pid),0);throw Error('Runner already active');}catch(e:any){if(e.code!=='ESRCH')throw e;}}this.db.prepare('INSERT OR REPLACE INTO lock(id,pid) VALUES(1,?)').run(process.pid);});}
 close(){try{if(this.db.prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name='lock'").get())this.db.prepare('DELETE FROM lock WHERE pid=?').run(process.pid);}finally{this.db.close();}}
 checkpoint(s:State,phase:string,input:any,output:any,decision:string,reason:string,write=()=>{},evaluationRevision?:number){
  this.tx(()=>{
   if(evaluationRevision!==undefined&&evaluationRevision!==this.get<number>('evaluationRevision')){
    s=this.state();phase='superseded';decision='discard';reason='Human feedback changed before commit; repeat with current criteria';
   }else{
    write();
    if(['plan','act','assess','save','review','observe'].includes(phase)){s.failures=0;s.retry=undefined;s.nextAt=undefined;s.reason=undefined;}
   }
   this.set('state',s);
   this.db.prepare('INSERT INTO steps(phase,iteration,input,output,decision,reason,next_state) VALUES(?,?,?,?,?,?,?)').run(phase,s.iteration,JSON.stringify(input),JSON.stringify(output),decision,reason,JSON.stringify(s));
  });
 }
 rate(id:string,accepted:boolean,reason:string,source:string,revision=this.revision(),human=false){
  if(!human&&this.db.prepare('SELECT human FROM results WHERE id=?').get(id)?.human===1)return;
  this.db.prepare('UPDATE results SET accepted=?,revision=?,human=?,reason=? WHERE id=?').run(Number(accepted),revision,Number(human),reason,id);
  this.db.prepare('INSERT INTO ratings(result_id,accepted,revision,source,reason) VALUES(?,?,?,?,?)').run(id,Number(accepted),revision,source,reason);
 }
 feedback(f:{criteria?:string;reason:string;ratings?:{id:string;accepted:boolean;reason:string}[]}){
  text(f.reason,'reason');if(!f.criteria&&!f.ratings?.length)throw Error('Feedback needs criteria or ratings');
  if(f.criteria!==undefined)text(f.criteria,'criteria');
  if(f.ratings!==undefined&&!Array.isArray(f.ratings))throw Error('ratings must be an array');
  for(const r of f.ratings??[]){text(r.id,'id',200);text(r.reason,'rating reason');if(typeof r.accepted!=='boolean'||!this.db.prepare('SELECT 1 FROM results WHERE id=?').get(r.id))throw Error('Invalid human rating or unknown result');}
  this.tx(()=>{
   this.db.prepare('INSERT INTO feedback(content) VALUES(?)').run(JSON.stringify(f));
   if(f.criteria!==undefined){const rev=this.revision()+1;this.db.prepare('INSERT INTO criteria_versions(id,text,reason) VALUES(?,?,?)').run(rev,f.criteria,f.reason);this.set('revision',rev);}
   for(const r of f.ratings??[])this.rate(r.id,r.accepted,r.reason,'human',this.revision(),true);
   // Ratings also invalidate an assessment already in flight, without changing the runner checkpoint.
   this.set('evaluationRevision',this.get<number>('evaluationRevision')+1);
  });
 }
 changeMethod(instruction:string,reason:string){text(instruction,'instruction');text(reason,'reason');this.tx(()=>{
  const m=this.method();if(m.status==='trial')throw Error('Finish the current method trial first');
  const id=this.db.prepare('INSERT INTO methods(instruction,parent,status,reason) VALUES(?,?,?,?)').run(instruction,Number(m.id),'trial',reason).lastInsertRowid;this.set('method',Number(id));
  this.db.prepare('INSERT INTO feedback(content) VALUES(?)').run(JSON.stringify({methodId:Number(id),instruction,reason}));
 });}
 resume(extraCalls?:number,extraIterations?:number){this.tx(()=>{const s=this.state();if(extraCalls!==undefined){if(!Number.isSafeInteger(extraCalls)||extraCalls<=0)throw Error('Invalid extra calls');const c=this.config();c.maxCalls+=extraCalls;this.set('config',c);}
 if(extraIterations!==undefined){if(!Number.isSafeInteger(extraIterations)||extraIterations<=0)throw Error('Invalid extra iterations');const c=this.config();c.maxIterations+=extraIterations;this.set('config',c);}
 this.db.prepare('INSERT INTO feedback(content) VALUES(?)').run(JSON.stringify({resume:true,extraCalls:extraCalls??0,extraIterations:extraIterations??0,previousStatus:s.status}));s.status='ready';s.failures=0;s.empty=0;s.reason=undefined;s.nextAt=undefined;this.set('state',s);
 });}
 context(phase:string,s:State,item?:any){
  const recent=this.db.prepare('SELECT o.*,r.accepted,r.revision AS current_revision,r.human,r.reason AS current_reason FROM observations o JOIN results r ON r.id=o.result_id ORDER BY o.id DESC LIMIT 50').all();
  const terms=new Set(JSON.stringify(item??s.action??this.config().task).toLowerCase().match(/[\p{L}\p{N}]{4,}/gu)??[]);
  const ranked=recent.map((r,i)=>({r,weight:[...terms].filter(t=>String(r.content).toLowerCase().includes(t)).length-i/100})).sort((a,b)=>b.weight-a.weight).slice(0,3).map(({r})=>({resultId:r.result_id,observation:JSON.parse(String(r.content)),accepted:r.current_revision===this.revision()||r.human===1?r.accepted:null,currentReason:r.current_reason}));
  const c=this.config(),m=this.method();
  const ctx={phase,task:c.task,criteria:this.criteria(),criteriaRevision:this.revision(),method:{id:m.id,instruction:m.instruction,status:m.status,passes:m.passes},goal:{accepted:this.accepted(),target:c.target},state:{iteration:s.iteration,phase:s.phase},tools:c.tools,
   action:phase==='act'?s.action:undefined,item,observations:ranked,
   recentActions:phase==='plan'?this.db.prepare('SELECT key FROM actions ORDER BY rowid DESC LIMIT 20').all().map(r=>r.key):undefined,
   retry:s.retry??null,feedback:this.db.prepare('SELECT content FROM feedback ORDER BY id DESC LIMIT 3').all().map(r=>JSON.parse(String(r.content))),schema:schemas[phase==='review'?'assess':phase]};
  if(Buffer.byteLength(JSON.stringify(ctx))>65000)throw new OperationError('blocked','Step context exceeds 65 KiB; reduce task evidence or adapter payload');return ctx;
 }
 async invoke(phase:string,s:State,item?:any){
  const ctx=this.context(phase,s,item),serialized=JSON.stringify(ctx);
  // A valid response saved before a crash can be reused only for identical bounded inputs.
  const saved=this.db.prepare('SELECT output FROM attempts WHERE phase=? AND input=? AND error IS NULL AND output IS NOT NULL ORDER BY id DESC LIMIT 1').get(phase,serialized);
  if(saved)return {value:JSON.parse(String(saved.output)),ctx};
  if(s.calls>=this.config().maxCalls)throw new OperationError('blocked','Call budget exhausted; resume with --extra-calls N');
  let id=0;this.tx(()=>{s.calls++;this.set('state',s);id=Number(this.db.prepare('INSERT INTO attempts(phase,input) VALUES(?,?)').run(phase,serialized).lastInsertRowid);});
  let value:any;
  try{
   value=await command(this.config().adapter,ctx,this.dir,this.config().timeoutSeconds,this.signal);
   check(phase==='review'?'assess':phase,value);
   if(phase==='plan'){
    if(!this.config().tools.includes(value.action.tool))throw new OperationError('invalid','Tool not allowed by run configuration');
    if(this.db.prepare('SELECT 1 FROM actions WHERE key=?').get(value.action.key))throw new OperationError('invalid',`Action ${value.action.key} already completed; choose a new action or hypothesis`);
   }
   if(phase==='act'&&this.db.prepare('SELECT 1 FROM results WHERE id=?').get(value.id))throw new OperationError('invalid',`Result ${value.id} already exists; choose a different action`);
   this.db.prepare('UPDATE attempts SET output=? WHERE id=?').run(JSON.stringify(value),id);
   return {value,ctx};
  }catch(e){this.db.prepare('UPDATE attempts SET output=?,error=? WHERE id=?').run(value===undefined?null:JSON.stringify(value),String(e),id);throw Object.assign(e as Error,{rejected:value??null});}
 }
 async step(){
  let s=this.state();
  if(['needs_input','paused'].includes(s.status))return;
  if(s.status==='complete'&&!this.stale()&&this.accepted()>=this.config().target)return;
  if(s.status==='complete')s.status='ready';
  if(s.nextAt&&Date.now()<s.nextAt)return;
  if(this.signal.aborted){s.status='paused';s.reason='Interrupted by operator';this.checkpoint(s,'pause',{}, {},'pause',s.reason);return;}
  const review=this.stale();
  const phase=review?'review':s.phase;
  const rev=this.revision(),evaluationRev=this.get<number>('evaluationRevision');
  let input:any={criteriaRevision:rev};
  try{
   if(!review&&s.phase==='plan'){
    if(this.accepted()>=this.config().target){s.status='complete';s.reason='Current accepted results meet the configured target';this.checkpoint(s,'goal',{},this.status(),'complete',s.reason,()=>{},evaluationRev);return;}
    if(s.iteration>this.config().maxIterations||s.empty>=this.config().noProgress)throw new OperationError('blocked','Iteration or no-progress limit reached; inspect results and revise the approach');
   }
   s.status='running';
   if(phase==='review'||phase==='assess'){
    const item=review?JSON.parse(String(review.item)):s.item;
    const response=await this.invoke(phase,s,item);input=response.ctx;
    if(evaluationRev!==this.get<number>('evaluationRevision')){
     this.checkpoint(s,'superseded',input,response.value,'discard','Human feedback arrived during assessment; reevaluate with current criteria');return;
    }
    if(review){this.checkpoint(s,'review',input,response.value,'reassess',response.value.reason,()=>this.rate(String(review.id),response.value.accepted,response.value.reason,'model',rev),evaluationRev);return;}
    s.assessment=response.value;s.assessmentRevision=rev;s.assessmentMethod=s.actionMethod;s.phase='save';
    this.checkpoint(s,phase,input,response.value,'assess',response.value.reason,()=>{},evaluationRev);
   }else if(phase==='save'){
    if(s.assessmentRevision!==rev){s.phase='assess';delete s.assessment;this.checkpoint(s,'invalidate',input,{},'reevaluate','Criteria changed before saving');return;}
    s.phase='observe';const a=s.assessment;
    this.checkpoint(s,'save',{itemId:s.item.id,revision:rev},a,'save',a.reason,()=>{
     const r=this.db.prepare('SELECT human FROM results WHERE id=?').get(s.item.id)!;
     if(r.human!==1)this.rate(s.item.id,a.accepted,a.reason,'model',rev);
    },evaluationRev);
   }else if(phase==='observe'){
    const current=this.db.prepare('SELECT accepted,reason FROM results WHERE id=?').get(s.item.id)!;
    const m=this.method();const response=await this.invoke('observe',s,{...s.item,assessment:current});input=response.ctx;
    const itemId=s.item.id;const methodId=Number(s.assessmentMethod??m.id);
    const hadFailures=!!this.get('iterationHadFailure');
    const eligible=m.status==='trial'&&methodId===m.id&&!hadFailures;
    const passes=Number(m.passes)+(eligible?1:0);
    if(eligible&&passes>=3&&response.value.methodDecision==='pending')throw new OperationError('invalid','Three complete trial passes are available; record keep or revert with a reason');
    const observation=response.value;
    s.empty=current.accepted===1?0:s.empty+1;s.iteration++;s.phase='plan';s.failures=0;s.retry=undefined;s.nextAt=undefined;s.action=undefined;s.item=undefined;s.assessment=undefined;s.assessmentMethod=undefined;s.actionMethod=undefined;s.assessmentRevision=undefined;
    this.checkpoint(s,'observe',input,observation,'continue',observation.reason,()=>{
     this.db.prepare('INSERT INTO observations(result_id,method,revision,content) VALUES(?,?,?,?)').run(itemId,methodId,rev,JSON.stringify(observation));
     if(eligible){this.db.prepare('UPDATE methods SET passes=? WHERE id=?').run(passes,m.id!);if(passes>=3){const keep=observation.methodDecision==='keep';this.db.prepare('UPDATE methods SET status=?,reason=? WHERE id=?').run(keep?'active':'reverted',observation.reason,m.id!);if(!keep)this.set('method',Number(m.parent));}}
     this.set('iterationHadFailure',false);
    },evaluationRev);
   }else if(phase==='plan'){
    const r=await this.invoke('plan',s);input=r.ctx;s.action=r.value.action;s.actionMethod=Number(r.ctx.method.id);s.phase='act';s.retry=undefined;s.nextAt=undefined;
    this.checkpoint(s,'plan',input,r.value,'execute',r.value.reason);
   }else if(phase==='act'){
    const r=await this.invoke('act',s);input=r.ctx;s.item=r.value;s.phase='assess';s.retry=undefined;s.nextAt=undefined;
    this.checkpoint(s,'act',input,r.value,'evaluate','Action evidence captured; evaluate before acceptance',()=>{
     this.db.prepare('INSERT INTO results(id,item,method) VALUES(?,?,?)').run(r.value.id,JSON.stringify(r.value),s.actionMethod!);
     this.db.prepare('INSERT INTO actions(key,item_id) VALUES(?,?)').run(s.action.key,r.value.id);
    });
   }else throw new OperationError('blocked','Unknown phase');
  }catch(e:any){
   if(!(e instanceof OperationError))throw e; // Storage/programming errors are not silently converted into task evidence.
   s=this.state();s.failures++;s.retry={phase,kind:e.kind,reason:e.message,rejected:(e as any).rejected??null,action:s.action??null};
   s.reason=e.message;
   if(this.signal.aborted)s.status='paused';
   else if(e.kind==='blocked'||s.failures>=this.config().maxFailures)s.status='needs_input';
   else{s.status='retrying';s.nextAt=Date.now()+this.config().retryDelayMs;if(phase==='act'&&e.kind==='invalid')s.phase='plan';}
   this.checkpoint(s,'failure',input,s.retry,s.status,e.message,()=>this.set('iterationHadFailure',true));
  }
 }
 async run(){while(!['complete','paused','needs_input'].includes(this.state().status)||this.state().status==='complete'&&(!!this.stale()||this.accepted()<this.config().target)){
  await this.step();const s=this.state();if(s.nextAt&&s.status==='retrying')await new Promise<void>(resolve=>{const ms=Math.max(0,Math.min(s.nextAt!-Date.now(),1000));setTimeout(resolve,ms);});
 }}
}
