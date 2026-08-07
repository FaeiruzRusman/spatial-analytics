
import {buildGrid, unionBuffers} from './baseModule.js';

export const FacilityAccessibilityModule = {
  id:'facility-accessibility',
  label:'Facility Accessibility',
  subtitle:'Measure population coverage around essential urban facilities.',
  inputs:['population','facilities'],
  renderInputs(){
    return `
      <div class="data-chip"><span>Population Layer</span><em>Population Demo</em></div>
      <div class="data-chip"><span>Facility Layer</span><em>Facilities Demo</em></div>
    `;
  },
  renderParameters(){
    return `
      <label>Facility Type
        <select id="param-facility-type">
          <option value="hospital">Hospital</option>
          <option value="school">School</option>
          <option value="police">Police</option>
        </select>
      </label>
      <label>Coverage Distance
        <select id="param-distance">
          <option value="1">1 km</option>
          <option value="3" selected>3 km</option>
          <option value="5">5 km</option>
          <option value="10">10 km</option>
        </select>
      </label>
    `;
  },
  async run({dataManager,bbox}){
    const start=performance.now();
    const population=dataManager.get('population').geojson;
    const allFacilities=dataManager.get('facilities').geojson;
    const type=document.getElementById('param-facility-type').value;
    const km=Number(document.getElementById('param-distance').value);
    const facilities=allFacilities.features.filter(f=>f.properties.type===type);
    const merged=unionBuffers(facilities,km);

    let total=0,served=0;
    population.features.forEach(p=>{
      const pop=Number(p.properties.population||0);
      total+=pop;
      if(merged && turf.booleanPointInPolygon(p,merged)) served+=pop;
    });
    const coverage=total?served/total*100:0;

    const grid=buildGrid(population,bbox,5);
    grid.features.forEach(cell=>{
      const covered=merged && turf.booleanPointInPolygon(turf.centroid(cell),merged);
      cell.properties.covered=covered?1:0;
      cell.properties.class=covered?2:(cell.properties.population>0?4:1);
    });
    const critical=grid.features.filter(f=>f.properties.class===4).length;
    const classCounts=[1,2,3,4].map(c=>grid.features.filter(f=>f.properties.class===c).length);

    return {
      type:this.id,label:this.label,geojson:grid,total,coverage,critical,units:grid.features.length,
      executionMs:Math.round(performance.now()-start),timestamp:Date.now(),
      facilities:turf.featureCollection(facilities),buffer:merged,classCounts,
      statistics:{'Facility Type':type,'Coverage Distance':km+' km','Population Served':Math.round(served).toLocaleString(),'Population Outside Coverage':Math.round(total-served).toLocaleString(),'Facility Count':facilities.length},
      aiInsight:`Approximately ${coverage.toFixed(1)}% of the analysed population is located within ${km} km of a ${type}. ${critical} populated grid units remain outside the defined service coverage. These underserved areas should be reviewed against settlement hierarchy, development intensity and planned facility provision before investment decisions are made.`,
      metadata:{input:'Population Demo + Facilities Demo',method:'Euclidean buffer + population overlay',crs:'WGS84 / EPSG:4326'}
    };
  }
};
