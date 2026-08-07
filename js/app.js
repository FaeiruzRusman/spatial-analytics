
import {DataManager} from './core/DataManager.js';
import {HistoryManager} from './core/HistoryManager.js';
import {AnalysisManager} from './core/AnalysisManager.js';
import {WorkflowManager} from './core/WorkflowManager.js';
import {ExportManager} from './core/ExportManager.js';
import {compact} from './modules/baseModule.js';
import {PopulationDensityModule} from './modules/PopulationDensity.js';
import {FacilityAccessibilityModule} from './modules/FacilityAccessibility.js';
import {UrbanServiceGapModule} from './modules/UrbanServiceGap.js';

const BBOX=[100.95,2.62,101.95,3.83];
const COLORS={1:'#2563eb',2:'#22c55e',3:'#f59e0b',4:'#ef4444'};

const dataManager=new DataManager();
const historyManager=new HistoryManager();
const analysisManager=new AnalysisManager();

analysisManager.register(PopulationDensityModule);
analysisManager.register(FacilityAccessibilityModule);
analysisManager.register(UrbanServiceGapModule);

function rnd(a,b){return a+Math.random()*(b-a)}
const population=turf.featureCollection(Array.from({length:240},(_,i)=>{
  const urban=Math.random()<0.75;
  const lon=urban?rnd(101.18,101.76):rnd(BBOX[0],BBOX[2]);
  const lat=urban?rnd(2.86,3.42):rnd(BBOX[1],BBOX[3]);
  return turf.point([lon,lat],{id:i+1,population:Math.round(rnd(500,18000))});
}));
const types=['hospital','school','police'];
const facilities=turf.featureCollection(Array.from({length:75},(_,i)=>{
  return turf.point([rnd(101.03,101.83),rnd(2.70,3.60)],{
    type:types[i%types.length],name:`${types[i%types.length].toUpperCase()} ${i+1}`
  });
}));
dataManager.register('population',{name:'Population Demo',type:'Point GeoJSON',status:'Ready',geojson:population});
dataManager.register('facilities',{name:'Facilities Demo',type:'Point GeoJSON',status:'Ready',geojson:facilities});

const map=L.map('map',{zoomControl:false}).setView([3.18,101.53],8);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
  maxZoom:19,attribution:'&copy; OpenStreetMap contributors'
}).addTo(map);
L.control.zoom({position:'topright'}).addTo(map);

let populationLayer=L.geoJSON(population,{
  pointToLayer:(f,ll)=>L.circleMarker(ll,{
    radius:Math.max(2,Math.min(7,Number(f.properties.population||0)/3000)),
    color:'#d9edff',weight:.5,fillColor:'#58a6ff',fillOpacity:.32
  })
}).addTo(map);

let resultLayer=null,facilityLayer=null,bufferLayer=null,importLayer=null;
let currentAnalysis='population-density';
let currentResult=null;

const workflow=new WorkflowManager(({percent,message,done})=>{
  document.getElementById('progressBar').style.width=percent+'%';
  document.getElementById('processStatus').textContent=message;
  const log=document.getElementById('processLog');
  const div=document.createElement('div');
  div.textContent='• '+message;
  if(done) div.classList.add('done');
  log.appendChild(div);
  log.scrollTop=log.scrollHeight;
  document.getElementById('mapStatusText').textContent=message;
});

function toast(msg){
  const t=document.getElementById('toast'); t.textContent=msg; t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'),1800);
}

function selectAnalysis(id){
  const module=analysisManager.get(id);
  if(!module) return;
  currentAnalysis=id;
  document.querySelectorAll('.analysis-item[data-analysis]').forEach(b=>b.classList.toggle('active',b.dataset.analysis===id));
  document.getElementById('analysisTitle').textContent=module.label;
  document.getElementById('analysisSubtitle').textContent=module.subtitle;
  document.getElementById('inputDataContent').innerHTML=module.renderInputs();
  document.getElementById('parameterContent').innerHTML=module.renderParameters();
  if(module.bindUI) module.bindUI();
  document.getElementById('processStatus').textContent='Ready to run.';
  document.getElementById('processLog').innerHTML='';
  document.getElementById('progressBar').style.width='0%';
}

function clearMapResults(){
  [resultLayer,facilityLayer,bufferLayer].forEach(l=>{if(l)map.removeLayer(l)});
  resultLayer=facilityLayer=bufferLayer=null;
}
function renderResult(result){
  clearMapResults();
  resultLayer=L.geoJSON(result.geojson,{
    style:f=>({color:'#d9edff',weight:.35,fillColor:COLORS[f.properties.class]||'#64748b',fillOpacity:.56}),
    onEachFeature:(f,l)=>{
      const p=f.properties;
      l.bindPopup(`<b>Analysis Unit</b><br>Population: ${Number(p.population||0).toLocaleString()}<br>Class: ${p.class||'-'}${p.score!==undefined?`<br>Score: ${Number(p.score).toFixed(2)}`:''}`);
    }
  }).addTo(map);

  if(result.buffer){
    bufferLayer=L.geoJSON(result.buffer,{style:{color:'#38bdf8',weight:2,fillOpacity:.05}}).addTo(map);
  }
  if(result.facilities){
    facilityLayer=L.geoJSON(result.facilities,{
      pointToLayer:(f,ll)=>L.circleMarker(ll,{radius:5,color:'#0ea5e9',weight:2,fillColor:'#fff',fillOpacity:1})
    }).addTo(map);
  }
}

function renderResultsUI(r){
  document.getElementById('kpiPopulation').textContent=compact(r.total);
  document.getElementById('kpiCoverage').textContent=r.coverage==null?'—':r.coverage.toFixed(1)+'%';
  document.getElementById('kpiCritical').textContent=r.critical.toLocaleString();
  document.getElementById('kpiUnits').textContent=r.units.toLocaleString();
  document.getElementById('kpiExecution').textContent=r.executionMs+' ms';

  document.getElementById('statisticsContent').innerHTML=Object.entries(r.statistics||{}).map(([k,v])=>`<b>${k}:</b> ${v}<br>`).join('');
  document.getElementById('aiInsight').textContent=r.aiInsight||'No insight generated.';
  document.getElementById('metadataContent').innerHTML=Object.entries(r.metadata||{}).map(([k,v])=>`<b>${k}:</b> ${v}<br>`).join('');

  const chart=document.getElementById('barChart'); chart.innerHTML='';
  const counts=r.classCounts||[0,0,0,0];
  const max=Math.max(...counts,1);
  ['Low','Moderate','High','Critical'].forEach((label,i)=>{
    const col=document.createElement('div'); col.className='bar-col';
    col.innerHTML=`<div class="bar" style="height:${Math.max(5,(counts[i]/max)*110)}px"></div><b>${counts[i]}</b><br>${label}`;
    chart.appendChild(col);
  });

  document.getElementById('exportGeoJSONBtn').disabled=false;
  document.getElementById('exportReportBtn').disabled=false;
  document.getElementById('view3DBtn').disabled=false;
}

function resetResultsUI(){
  ['kpiPopulation','kpiCoverage','kpiCritical','kpiUnits','kpiExecution'].forEach(id=>document.getElementById(id).textContent='—');
  document.getElementById('statisticsContent').textContent='Run an analysis to calculate statistics.';
  document.getElementById('barChart').innerHTML='';
  document.getElementById('aiInsight').textContent='Run an analysis to generate an interpretation.';
  document.getElementById('metadataContent').textContent='No analysis metadata yet.';
  document.getElementById('exportGeoJSONBtn').disabled=true;
  document.getElementById('exportReportBtn').disabled=true;
  document.getElementById('view3DBtn').disabled=true;
}

function renderLayerList(){
  document.getElementById('layerList').innerHTML=dataManager.list().map(l=>`
    <div class="source-row"><span>${l.name}</span><em class="ok">${l.status}</em></div>
  `).join('');
}
function renderHistory(){
  const items=historyManager.list();
  document.getElementById('historyList').innerHTML=items.length?items.map(h=>`
    <div class="history-item"><span>Completed</span><b>${h.label}</b><small>${new Date(h.timestamp).toLocaleString()}</small></div>
  `).join(''):`<div style="font-size:9px;color:#6f8ea2;padding:8px 2px">No analysis history yet.</div>`;
}

async function runCurrentAnalysis(){
  const btn=document.getElementById('runAnalysisBtn');
  btn.disabled=true; btn.textContent='Processing...';
  document.getElementById('processLog').innerHTML='';
  document.getElementById('progressBar').style.width='0%';

  const steps=[
    'Validating input layers',
    'Preparing spatial workspace',
    'Building spatial index',
    'Executing analysis model',
    'Calculating statistics',
    'Generating decision-support insight'
  ];

  try{
    const result=await workflow.execute(steps,()=>analysisManager.run(currentAnalysis,{dataManager,bbox:BBOX}));
    currentResult=result;
    renderResult(result);
    renderResultsUI(result);
    historyManager.add({type:result.type,label:result.label,timestamp:result.timestamp,critical:result.critical});
    renderHistory();
    toast('Analysis completed.');
  }catch(err){
    console.error(err);
    document.getElementById('processStatus').textContent='Analysis failed.';
    toast('Analysis failed. Check console.');
  }finally{
    btn.disabled=false; btn.textContent='Run Analysis';
  }
}

document.querySelectorAll('.analysis-item[data-analysis]').forEach(btn=>{
  btn.addEventListener('click',()=>selectAnalysis(btn.dataset.analysis));
});

document.querySelectorAll('.nav-tab').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.querySelectorAll('.nav-tab').forEach(b=>b.classList.remove('active'));
    document.querySelectorAll('.left-view').forEach(v=>v.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('left-'+btn.dataset.lefttab).classList.add('active');
  });
});

document.querySelectorAll('.result-tab').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.querySelectorAll('.result-tab').forEach(b=>b.classList.remove('active'));
    document.querySelectorAll('.result-view').forEach(v=>v.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('result-'+btn.dataset.resulttab).classList.add('active');
  });
});

document.getElementById('analysisSearch').addEventListener('input',e=>{
  const q=e.target.value.toLowerCase();
  document.querySelectorAll('.analysis-item').forEach(i=>{
    i.style.display=i.textContent.toLowerCase().includes(q)?'flex':'none';
  });
});

document.getElementById('runAnalysisBtn').addEventListener('click',runCurrentAnalysis);
document.getElementById('clearResultBtn').addEventListener('click',()=>{
  currentResult=null;clearMapResults();resetResultsUI();toast('Result cleared.');
});
document.getElementById('resetWorkspaceBtn').addEventListener('click',()=>{
  currentResult=null;clearMapResults();resetResultsUI();map.setView([3.18,101.53],8);selectAnalysis('population-density');toast('Workspace reset.');
});
document.getElementById('homeMapBtn').addEventListener('click',()=>map.setView([3.18,101.53],8));
document.getElementById('togglePopulationBtn').addEventListener('click',e=>{
  if(map.hasLayer(populationLayer)){map.removeLayer(populationLayer);e.currentTarget.classList.remove('active')}
  else{populationLayer.addTo(map);e.currentTarget.classList.add('active')}
});
document.getElementById('toggleResultBtn').addEventListener('click',e=>{
  if(!resultLayer)return;
  if(map.hasLayer(resultLayer)){map.removeLayer(resultLayer);e.currentTarget.classList.remove('active')}
  else{resultLayer.addTo(map);e.currentTarget.classList.add('active')}
});
document.getElementById('exportGeoJSONBtn').addEventListener('click',()=>currentResult&&ExportManager.downloadGeoJSON(`SUO_${currentResult.type}_result.geojson`,currentResult.geojson));
document.getElementById('exportReportBtn').addEventListener('click',()=>currentResult&&ExportManager.downloadReport(currentResult));
document.getElementById('view3DBtn').addEventListener('click',()=>toast('3D GeoPortal integration endpoint will be connected in the next phase.'));
document.getElementById('openGeoportalBtn').addEventListener('click',()=>toast('Set the production 3D GeoPortal URL in app.js.'));
document.getElementById('clearHistoryBtn').addEventListener('click',()=>{historyManager.clear();renderHistory();toast('History cleared.');});

document.getElementById('geojsonUpload').addEventListener('change',e=>{
  const file=e.target.files[0]; if(!file)return;
  const reader=new FileReader();
  reader.onload=()=>{
    try{
      const gj=JSON.parse(reader.result);
      const id='import-'+Date.now();
      dataManager.importGeoJSON(id,file.name,gj);
      if(importLayer)map.removeLayer(importLayer);
      importLayer=L.geoJSON(gj,{style:{color:'#a78bfa',weight:1.5,fillOpacity:.08}}).addTo(map);
      renderLayerList();
      toast('GeoJSON imported.');
    }catch(err){toast('Invalid GeoJSON.');}
  };
  reader.readAsText(file);
});

renderLayerList();
renderHistory();
selectAnalysis('population-density');
