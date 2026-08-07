
export class ExportManager {
  static downloadGeoJSON(filename, geojson){
    const blob = new Blob([JSON.stringify(geojson,null,2)], {type:'application/geo+json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    setTimeout(()=>URL.revokeObjectURL(a.href),1000);
  }

  static downloadReport(result){
    const text = [
      'SELANGOR URBAN OBSERVATORY',
      'SPATIAL ANALYTICS ENGINE - ANALYSIS REPORT',
      '',
      `Analysis: ${result.label}`,
      `Date: ${new Date(result.timestamp).toLocaleString()}`,
      `Population Analysed: ${Math.round(result.total||0).toLocaleString()}`,
      `Coverage: ${result.coverage == null ? 'N/A' : result.coverage.toFixed(1)+'%'}`,
      `Critical Areas: ${result.critical}`,
      `Analysis Units: ${result.units}`,
      `Execution Time: ${result.executionMs} ms`,
      '',
      'URBAN PLANNING AI INSIGHT',
      result.aiInsight || 'No insight generated.',
      '',
      'NOTE',
      'Prototype result. Current Phase 1 uses synthetic demo datasets unless replaced with verified SUO datasets.'
    ].join('\n');

    const blob = new Blob([text], {type:'text/plain'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `SUO_${result.type}_report.txt`;
    a.click();
    setTimeout(()=>URL.revokeObjectURL(a.href),1000);
  }
}
