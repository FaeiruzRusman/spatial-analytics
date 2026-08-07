
export class WorkflowManager {
  constructor(onProgress){
    this.onProgress = onProgress || (()=>{});
  }

  async execute(steps, callback){
    for(let i=0;i<steps.length;i++){
      const pct = Math.round(((i+1)/steps.length)*88);
      this.onProgress({percent:pct, message:steps[i], done:false});
      await new Promise(r=>setTimeout(r, 240));
    }
    const result = await callback();
    this.onProgress({percent:100, message:'Analysis completed successfully.', done:true});
    return result;
  }
}
