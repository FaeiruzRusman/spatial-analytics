
export class HistoryManager {
  constructor(storageKey='suoSpatialAnalyticsHistory'){
    this.storageKey = storageKey;
    this.items = this.load();
  }

  load(){
    try { return JSON.parse(localStorage.getItem(this.storageKey)) || []; }
    catch(e){ return []; }
  }

  save(){
    localStorage.setItem(this.storageKey, JSON.stringify(this.items.slice(0,30)));
  }

  add(item){
    this.items.unshift(item);
    this.items = this.items.slice(0,30);
    this.save();
  }

  clear(){
    this.items = [];
    this.save();
  }

  list(){
    return this.items;
  }
}
