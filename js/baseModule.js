
export function compact(n){
  if(n>=1e6) return (n/1e6).toFixed(2)+'M';
  if(n>=1e3) return (n/1e3).toFixed(0)+'K';
  return Math.round(n).toLocaleString();
}

export function quantileClass(values, value){
  const a=[...values].sort((x,y)=>x-y);
  const q=p=>a[Math.min(a.length-1,Math.floor((a.length-1)*p))]||0;
  if(value<=q(.25)) return 1;
  if(value<=q(.50)) return 2;
  if(value<=q(.75)) return 3;
  return 4;
}

export function buildGrid(populationGeoJSON, bbox, km){
  const grid=turf.squareGrid(bbox, km, {units:'kilometers'});
  grid.features.forEach((cell,idx)=>{
    let pop=0;
    populationGeoJSON.features.forEach(pt=>{
      if(turf.booleanPointInPolygon(pt,cell)) pop += Number(pt.properties.population||0);
    });
    cell.properties = {id:idx+1, population:pop};
  });
  return grid;
}

export function unionBuffers(features, km){
  let merged=null;
  features.forEach(f=>{
    const b=turf.buffer(f, km, {units:'kilometers'});
    if(!merged) merged=b;
    else {
      try { merged=turf.union(turf.featureCollection([merged,b])); }
      catch(e){}
    }
  });
  return merged;
}
