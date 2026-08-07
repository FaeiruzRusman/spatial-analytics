
import {buildGrid, quantileClass} from './baseModule.js';

export const PopulationDensityModule = {
  id:'population-density',
  label:'Population Density',
  subtitle:'Analyse population concentration using spatial grid units.',
  inputs:['population'],
  renderInputs(){
    return `
      <div class="data-chip"><span>Population Layer</span><em>Population Demo</em></div>
      <div class="data-chip"><span>Study Area</span><em>Selangor Extent</em></div>
    `;
  },
  renderParameters(){
    return `
      <label>Grid Size
        <select id="param-grid-size">
          <option value="2">2 km</option>
          <option value="5" selected>5 km</option>
          <option value="10">10 km</option>
        </select>
      </label>
      <label>Classification
        <select id="param-classification">
          <option>Quartile</option>
        </select>
      </label>
    `;
  },
  async run({dataManager,bbox}){
    const start=performance.now();
    const population=dataManager.get('population').geojson;
    const km=Number(document.getElementById('param-grid-size').value);
    const grid=buildGrid(population,bbox,km);
    const vals=grid.features.map(f=>f.properties.population);
    grid.features.forEach(f=>f.properties.class=quantileClass(vals,f.properties.population));
    const total=vals.reduce((a,b)=>a+b,0);
    const critical=grid.features.filter(f=>f.properties.class===4&&f.properties.population>0).length;
    const classCounts=[1,2,3,4].map(c=>grid.features.filter(f=>f.properties.class===c).length);
    const populated=vals.filter(v=>v>0);
    const max=Math.max(...vals,0);
    const mean=populated.length?populated.reduce((a,b)=>a+b,0)/populated.length:0;
    const aiInsight=`The analysis identifies ${critical} grid units in the highest population-density class. These areas should be prioritised for infrastructure capacity review, facility-demand assessment and development-pressure monitoring. The highest grid population is approximately ${Math.round(max).toLocaleString()} persons, while the average populated grid contains about ${Math.round(mean).toLocaleString()} persons.`;
    return {
      type:this.id,label:this.label,geojson:grid,total,coverage:null,critical,units:grid.features.length,
      executionMs:Math.round(performance.now()-start),timestamp:Date.now(),
      classCounts,
      statistics:{'Grid Size':km+' km','Highest Grid Population':Math.round(max).toLocaleString(),'Average Populated Grid':Math.round(mean).toLocaleString(),'Populated Units':populated.length.toLocaleString()},
      aiInsight,
      metadata:{input:'Population Demo',method:'Square grid aggregation + quartile classification',crs:'WGS84 / EPSG:4326'}
    };
  }
};
