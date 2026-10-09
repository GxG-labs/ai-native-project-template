import {spawn} from 'node:child_process';

export class OperationError extends Error {
  constructor(public kind: 'transient'|'invalid'|'blocked', message:string) {super(message);}
}
export function command(argv:string[], input:unknown, cwd:string, timeout:number, signal:AbortSignal):Promise<any> {
  return new Promise((resolve,reject)=>{
    const child=spawn(argv[0],argv.slice(1),{cwd,stdio:['pipe','pipe','pipe'],detached:true});
    let stdout='',stderr='',size=0,finished=false;
    const kill=()=>{try{process.kill(-child.pid!,'SIGKILL');}catch{}};
    const done=(error?:Error,value?:unknown)=>{
      if(finished)return;finished=true;clearTimeout(timer);signal.removeEventListener('abort',abort);
      if(error){kill();reject(error);}else resolve(value);
    };
    const abort=()=>done(new OperationError('blocked','Interrupted by operator'));
    const timer=setTimeout(()=>done(new OperationError('transient','Adapter timed out')),timeout*1000);
    signal.addEventListener('abort',abort,{once:true});
    if(signal.aborted)abort();
    child.stdout.on('data',b=>{size+=b.length;if(size>262144)done(new OperationError('invalid','Adapter output exceeds 256 KiB'));else stdout+=b;});
    child.stderr.on('data',b=>stderr=(stderr+b).slice(-2000));
    child.on('error',e=>done(new OperationError('blocked',e.message)));
    child.on('close',code=>{
      if(code!==0)return done(new OperationError('transient',`Adapter exit ${code}: ${stderr}`));
      try {const value=JSON.parse(stdout);if(value.error){const k=value.error.kind;done(new OperationError(['transient','invalid','blocked'].includes(k)?k:'invalid',String(value.error.reason)));}else done(undefined,value);}
      catch{done(new OperationError('invalid','Adapter did not return one JSON object'));}
    });
    child.stdin.on('error',()=>{});child.stdin.end(JSON.stringify(input));
  });
}
