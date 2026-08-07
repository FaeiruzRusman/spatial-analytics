
export class AnalysisManager {
  constructor(){
    this.modules = new Map();
  }

  register(module){
    this.modules.set(module.id, module);
  }

  get(id){
    return this.modules.get(id);
  }

  list(){
    return [...this.modules.values()];
  }

  async run(id, context){
    const module = this.get(id);
    if(!module) throw new Error(`Analysis module not found: ${id}`);
    return await module.run(context);
  }
}
