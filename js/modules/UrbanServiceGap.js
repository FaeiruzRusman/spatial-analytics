
import {buildGrid, quantileClass, unionBuffers} from './baseModule.js';

export const UrbanServiceGapModule = {
  id:'urban-service-gap',
  label:'Urban Service Gap',
  subtitle:'Identify high-population areas with inadequate facility access.',
  inputs:['population','facilities'],
  renderInputs(){
    return `
      <div class="data-chip"><span>Population Layer</span><em>Population Demo</em></div>
      <div class="data-chip"><span>Reference Facility</span><em>Hospital Demo</em></div>
    `;
  },
  renderParameters(){
    return `
      <label>Population Weight
        <input id="param-pop-weight" type="range" min="0" max="100" value="60"/>
        <div style="text-align:right;font-size:8px;color:#9bb5c6"><span id="popWeightLabel">60</span>%</div>
      </label>
      <label>Accessibility Weight
        <input id="param-access-weight" type="range" min="0" max="100" value="40"/>
        <div style="text-align:right;font-size:8px;color:#9bb5c6"><span id="accessWeightLabel">40</span>%</div>
      </label>
      <label>Hospital Coverage
        <select id="param-gap-distance">
          <option value="3">3 km</option>
          <option value="5" selected>5 km</option>
          <option value="10">10 km</option>
        </select>
      </label>
    `;
  },
  bindUI(){
    const p=document.getElementById('param-pop-weight');
    const a=document.getElementById('param-access-weight');
    if(p) p.oninput=()=>document.getElementById('popWeightLabel').textContent=p.value;
    if(a) a.oninput=()=>document.getElementById('accessWeightLabel').textContent=a.value;
  },
  async run({dataManager,bbox}){
    const start=performance.now();
    const population=dataManager.get('population').geojson;
    const allFacilities=dataManager.get('facilities').geojson;
    const hospitals=allFacilities.features.filter(f=>f.properties.type==='hospital');
    const km=Number(document.getElementById('param-gap-distance').value);
    let pw=Number(document.getElementById('param-pop-weight').value);
    let aw=Number(document.getElementById('param-access-weight').value);
    const tw=(pw+aw)||100; pw/=tw; aw/=tw;
    const buffer=unionBuffers(hospitals,km);

    const grid=buildGrid(population,bbox,5);
    const maxPop=Math.max(...grid.features.map(f=>f.properties.population),1);
    grid.features.forEach(cell=>{
      const popScore=cell.properties.population/maxPop;
      const accessGap=buffer && turf.booleanPointInPolygon(turf.centroid(cell),buffer)?0:1;
      cell.properties.score=(popScore*pw)+(accessGap*aw);
    });
    const scores=grid.features.map(f=>f.properties.score);
    grid.features.forEach(f=>f.properties.class=quantileClass(scores,f.properties.score));

    let total=0,served=0;
    population.features.forEach(p=>{
      const pop=Number(p.properties.population||0); total+=pop;
      if(buffer && turf.booleanPointInPolygon(p,buffer)) served+=pop;
    });
    const coverage=total?served/total*100:0;
    const critical=grid.features.filter(f=>f.properties.class===4&&f.properties.population>0).length;
    const classCounts=[1,2,3,4].map(c=>grid.features.filter(f=>f.properties.class===c).length);
    const maxScore=Math.max(...scores,0);

    return {
      type:this.id,label:this.label,geojson:grid,total,coverage,critical,units:grid.features.length,
      executionMs:Math.round(performance.now()-start),timestamp:Date.now(),classCounts,
      statistics:{'Population Weight':Math.round(pw*100)+'%','Accessibility Weight':Math.round(aw*100)+'%','Reference Coverage':km+' km','Maximum Gap Score':maxScore.toFixed(2)},
      aiInsight:`The Urban Service Gap Index identifies ${critical} critical grid units where population pressure and facility-access deficiency overlap. These locations represent priority areas for detailed planning review. The index should later be enhanced using verified PBT boundaries, actual facility capacity, road-network travel time, settlement hierarchy and statutory planning context.`,
      metadata:{input:'Population Demo + Hospital Demo',method:'Weighted composite index',crs:'WGS84 / EPSG:4326'}
    };
  }
};
