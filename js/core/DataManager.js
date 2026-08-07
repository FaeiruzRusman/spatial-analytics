
export class DataManager {
  constructor(){
    this.layers = new Map();
  }

  register(id, layer){
    this.layers.set(id, layer);
  }

  get(id){
    return this.layers.get(id);
  }

  list(){
    return [...this.layers.entries()].map(([id,layer]) => ({
      id,
      name: layer.name || id,
      type: layer.type || 'GeoJSON',
      status: layer.status || 'Ready'
    }));
  }

  importGeoJSON(id, name, geojson){
    this.register(id, {name, type:'Imported GeoJSON', status:'Ready', geojson});
  }
}
