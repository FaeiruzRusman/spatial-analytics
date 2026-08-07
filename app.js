
const map = L.map('map', {zoomControl:true}).setView([3.18,101.53], 8);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
  maxZoom:19,
  attribution:'&copy; OpenStreetMap contributors'
}).addTo(map);

const COLORS={1:'#2563eb',2:'#22c55e',3:'#f59e0b',4:'#ef4444'};
const SELANGOR_BBOX=[100.95,2.62,101.95,3.83];

let activeTool='density';
let resultLayer=null;
let facilityLayer=null;
let bufferLayer=null;
let lastResult=null;

function rnd(a,b){return a+Math.random()*(b-a)}

const populationGeoJSON=turf.featureCollection(
  Array.from({length:220},(_,i)=>{
    const urban=Math.random()<0.75;
    const lon=urban?rnd(101.20,101.75):rnd(SELANGOR_BBOX[0],SELANGOR_BBOX[2]);
    const lat=urban?rnd(2.88,3.40):rnd(SELANGOR_BBOX[1],SELANGOR_BBOX[3]);
    return turf.point([lon,lat],{population:Math.round(rnd(600,18000)),id:i+1});
  })
);

const FACILITY_TYPES=['hospital','school','police'];
const facilityGeoJSON=turf.featureCollection(
  Array.from({length:72},(_,i)=>{
    const type=FACILITY_TYPES[i%3];
    return turf.point(
      [rnd(101.03,101.82),rnd(2.70,3.58)],
      {type,name:`${type.toUpperCase()} ${i+1}`}
    );
  })
);

L.geoJSON(populationGeoJSON,{
  pointToLayer:(f,ll)=>L.circleMarker(ll,{
    radius:Math.max(2,Math.min(8,f.properties.population/2500)),
    weight:.6,color:'#dbeafe',fillColor:'#60a5fa',fillOpacity:.35
  })
}).addTo(map);

function buildGrid(km=5){
  const grid=turf.squareGrid(SELANGOR_BBOX,km,{units:'kilometers'});
  grid.features.forEach((cell,idx)=>{
    let pop=0;
    populationGeoJSON.features.forEach(pt=>{
      if(turf.booleanPointInPolygon(pt,cell)) pop+=pt.properties.population;
    });
    cell.properties={id:idx+1,population:pop};
  });
  return grid;
}
function classify(values,v){
  const a=[...values].sort((x,y)=>x-y);
  const q=p=>a[Math.min(a.length-1,Math.floor((a.length-1)*p))]||0;
  if(v<=q(.25)) return 1;
  if(v<=q(.50)) return 2;
  if(v<=q(.75)) return 3;
  return 4;
}
function unionBuffers(features,km){
  let merged=null;
  features.forEach(f=>{
    const b=turf.buffer(f,km,{units:'kilometers'});
    if(!merged) merged=b;
    else { try{ merged=turf.union(turf.featureCollection([merged,b])); }catch(e){} }
  });
  return merged;
}
function densityAnalysis(){
  const km=Number(document.getElementById('gridSize').value);
  const grid=buildGrid(km);
  const vals=grid.features.map(f=>f.properties.population);
  grid.features.forEach(f=>f.properties.class=classify(vals,f.properties.population));
  return {
    type:'density',geojson:grid,total:vals.reduce((a,b)=>a+b,0),coverage:null,
    critical:grid.features.filter(f=>f.properties.class===4&&f.properties.population>0).length,
    units:grid.features.length
  };
}
function accessibilityAnalysis(){
  const type=document.getElementById('facilityType').value;
  const km=Number(document.getElementById('bufferDistance').value);
  const facilities=facilityGeoJSON.features.filter(f=>f.properties.type===type);
  const merged=unionBuffers(facilities,km);

  let total=0,served=0;
  populationGeoJSON.features.forEach(p=>{
    total+=p.properties.population;
    if(merged && turf.booleanPointInPolygon(p,merged)) served+=p.properties.population;
  });

  const grid=buildGrid(5);
  grid.features.forEach(cell=>{
    const covered=merged&&turf.booleanPointInPolygon(turf.centroid(cell),merged);
    cell.properties.covered=covered?1:0;
    cell.properties.class=covered?2:(cell.properties.population>0?4:1);
  });

  return {
    type:'access',geojson:grid,total,coverage:total?served/total*100:0,
    critical:grid.features.filter(f=>f.properties.class===4).length,
    units:grid.features.length,facilities:turf.featureCollection(facilities),
    buffer:merged,facilityType:type,km
  };
}
function gapAnalysis(){
  let pw=Number(document.getElementById('popWeight').value);
  let aw=Number(document.getElementById('accessWeight').value);
  const totalW=(pw+aw)||100;
  pw/=totalW; aw/=totalW;

  const facilities=facilityGeoJSON.features.filter(f=>f.properties.type==='hospital');
  const merged=unionBuffers(facilities,5);
  const grid=buildGrid(5);
  const maxPop=Math.max(...grid.features.map(f=>f.properties.population),1);

  grid.features.forEach(cell=>{
    const popScore=cell.properties.population/maxPop;
    const accessGap=(merged&&turf.booleanPointInPolygon(turf.centroid(cell),merged))?0:1;
    cell.properties.score=(popScore*pw)+(accessGap*aw);
  });

  const vals=grid.features.map(f=>f.properties.score);
  grid.features.forEach(f=>f.properties.class=classify(vals,f.properties.score));

  let total=0,served=0;
  populationGeoJSON.features.forEach(p=>{
    total+=p.properties.population;
    if(merged&&turf.booleanPointInPolygon(p,merged)) served+=p.properties.population;
  });

  return {
    type:'gap',geojson:grid,total,coverage:total?served/total*100:0,
    critical:grid.features.filter(f=>f.properties.class===4&&f.properties.population>0).length,
    units:grid.features.length
  };
}
function clearResultLayers(){
  [resultLayer,facilityLayer,bufferLayer].forEach(l=>{if(l) map.removeLayer(l)});
  resultLayer=facilityLayer=bufferLayer=null;
}
function renderResult(r){
  clearResultLayers();
  resultLayer=L.geoJSON(r.geojson,{
    style:f=>({color:'#dcecf7',weight:.35,fillColor:COLORS[f.properties.class]||'#64748b',fillOpacity:.58}),
    onEachFeature:(f,l)=>{
      const p=f.properties;
      l.bindPopup(`<b>Analysis Unit</b><br>Population: ${(p.population||0).toLocaleString()}<br>Class: ${p.class||'-'}${p.score!==undefined?`<br>Gap Score: ${Number(p.score).toFixed(2)}`:''}`);
    }
  }).addTo(map);

  if(r.buffer){
    bufferLayer=L.geoJSON(r.buffer,{style:{color:'#38bdf8',weight:2,fillOpacity:.05}}).addTo(map);
  }
  if(r.facilities){
    facilityLayer=L.geoJSON(r.facilities,{
      pointToLayer:(f,ll)=>L.circleMarker(ll,{radius:5,color:'#0ea5e9',weight:2,fillColor:'#fff',fillOpacity:1})
    }).addTo(map);
  }
}
function compact(n){
  if(n>=1e6)return(n/1e6).toFixed(2)+'M';
  if(n>=1e3)return(n/1e3).toFixed(0)+'K';
  return Math.round(n).toString();
}
function updateSummary(r){
  document.getElementById('kpiPopulation').textContent=compact(r.total);
  document.getElementById('kpiCoverage').textContent=r.coverage==null?'—':r.coverage.toFixed(1)+'%';
  document.getElementById('kpiCritical').textContent=r.critical;
  document.getElementById('kpiUnits').textContent=r.units;

  let msg='';
  if(r.type==='density'){
    msg=`${r.critical} analysis units are in the highest population-density class. These locations should be prioritised for infrastructure capacity, development pressure and facility-demand review.`;
  } else if(r.type==='access'){
    msg=`${r.coverage.toFixed(1)}% of the analysed population is within ${r.km} km of a ${r.facilityType}. ${r.critical} populated analysis units remain outside the service coverage.`;
  } else {
    msg=`${r.critical} analysis units are classified as critical Urban Service Gap areas based on population pressure and accessibility deficiency.`;
  }
  document.getElementById('insight').textContent=msg;
  document.getElementById('exportBtn').disabled=false;
}
document.querySelectorAll('.tool').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.querySelectorAll('.tool').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    activeTool=btn.dataset.tool;
    const configs={
      density:['Population Density','Analyse population concentration using spatial grid units.'],
      access:['Facility Accessibility','Measure population coverage around essential urban facilities.'],
      gap:['Urban Service Gap','Identify high-population areas with inadequate facility access.']
    };
    document.getElementById('workspaceTitle').textContent=configs[activeTool][0];
    document.getElementById('workspaceDesc').textContent=configs[activeTool][1];
    document.getElementById('densityControls').classList.toggle('hidden',activeTool!=='density');
    document.getElementById('accessControls').classList.toggle('hidden',activeTool!=='access');
    document.getElementById('gapControls').classList.toggle('hidden',activeTool!=='gap');
  });
});
document.getElementById('runBtn').addEventListener('click',()=>{
  let r;
  if(activeTool==='density')r=densityAnalysis();
  if(activeTool==='access')r=accessibilityAnalysis();
  if(activeTool==='gap')r=gapAnalysis();
  lastResult=r;
  renderResult(r);
  updateSummary(r);
});
document.getElementById('resetBtn').addEventListener('click',()=>{
  clearResultLayers();
  lastResult=null;
  ['kpiPopulation','kpiCoverage','kpiCritical','kpiUnits'].forEach(id=>document.getElementById(id).textContent='—');
  document.getElementById('insight').textContent='Run an analysis to generate spatial intelligence.';
  document.getElementById('exportBtn').disabled=true;
});
document.getElementById('popWeight').addEventListener('input',e=>document.getElementById('popWeightValue').textContent=e.target.value+'%');
document.getElementById('accessWeight').addEventListener('input',e=>document.getElementById('accessWeightValue').textContent=e.target.value+'%');

document.getElementById('geojsonUpload').addEventListener('change',e=>{
  const file=e.target.files[0];
  if(!file)return;
  const reader=new FileReader();
  reader.onload=()=>{
    try{
      const data=JSON.parse(reader.result);
      L.geoJSON(data,{style:{color:'#a78bfa',weight:1.5,fillOpacity:.08}}).addTo(map);
      alert('GeoJSON imported into workspace.');
    }catch(err){alert('Invalid GeoJSON file.');}
  };
  reader.readAsText(file);
});
document.getElementById('exportBtn').addEventListener('click',()=>{
  if(!lastResult)return;
  const blob=new Blob([JSON.stringify(lastResult.geojson,null,2)],{type:'application/geo+json'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download=`suo_${lastResult.type}_result.geojson`;
  a.click();
  URL.revokeObjectURL(a.href);
});
