import {parseArgs} from 'node:util';
import {cpSync,existsSync,readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve,join,dirname,basename} from 'node:path';
import {fileURLToPath} from 'node:url';
import {Cycle,validateConfig} from './runtime.js';
const {values,positionals}=parseArgs({allowPositionals:true,options:{run:{type:'string'},template:{type:'string'},file:{type:'string'},demo:{type:'boolean'},'extra-calls':{type:'string'},'extra-iterations':{type:'string'}}});
const action=positionals[0];
const root=resolve(dirname(fileURLToPath(import.meta.url)),'../../..');
let cycle:Cycle|undefined;
try{
 if(!values.run||!['init','run','step','resume','status','feedback','method','migrate'].includes(action))throw Error('Usage: npm run cycle -- init|run|step|resume|status|feedback|method|migrate --run PATH [--demo] [--file JSON] [--extra-calls N]');
 const dir=resolve(values.run);
 if(action==='init'){
  if(existsSync(dir))throw Error('Choose a new run directory');
  const template=resolve(values.template??join(root,'templates/self-improving-loop'));
  const config=JSON.parse(readFileSync(join(template,'config.json'),'utf8'));
  if(values.demo)config.adapter.push('--demo');validateConfig(config);
  mkdirSync(dirname(dir),{recursive:true});cpSync(template,dir,{recursive:true,filter:source=>!/^memory\.sqlite(?:-wal|-shm|-journal)?$/.test(basename(source))});
  writeFileSync(join(dir,'config.json'),JSON.stringify(config,null,2)+'\n');
  cycle=new Cycle(dir);cycle.initialize(config);cycle.lock();cycle.migrate();
 }else{
  if(!existsSync(join(dir,'memory.sqlite')))throw Error('Run not initialized');
  const controller=new AbortController();process.once('SIGINT',()=>controller.abort());process.once('SIGTERM',()=>controller.abort());
  cycle=new Cycle(dir,controller.signal);
  if(action==='feedback'||action==='method'){
   if(!values.file)throw Error('--file JSON required');const f=JSON.parse(readFileSync(resolve(values.file),'utf8'));
   if(action==='feedback')cycle.feedback(f);else cycle.changeMethod(f.instruction,f.reason);
  }else if(action!=='status'){
   cycle.lock();if(action==='resume')cycle.resume(values['extra-calls']?Number(values['extra-calls']):undefined,values['extra-iterations']?Number(values['extra-iterations']):undefined);
   if(action==='migrate')cycle.migrate();else if(action==='step')await cycle.step();else await cycle.run();
  }
 }
 const status=cycle.status();console.log(JSON.stringify(status));
 if(status.status==='needs_input'&&action!=='status'&&action!=='feedback')process.exitCode=2;
}catch(e){console.error(String(e));process.exitCode=1;}finally{cycle?.close();}
