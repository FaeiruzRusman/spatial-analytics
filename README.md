# SUO Spatial Analytics Engine v5.0 — Production Foundation

## Core decision
v5.0 removes synthetic Population Density, random population points, synthetic facilities and fake KPIs.

## Operational modules

### 1. DOSM District Population
Works immediately.
- Official DOSM/OpenDOSM district population 2020–2025
- Same 9 district polygons used by SUO GeoPortal
- district ranking
- chart
- planning interpretation

### 2. Facility Accessibility
Requires an imported verified Point GeoJSON facility layer.
- Euclidean buffer coverage
- facility count by district
- district land-area coverage percentage
- districts with zero facilities
- no fake population-served estimate

### 3. Urban Service Gap
Requires an imported verified Point GeoJSON facility layer.
- official DOSM district population
- facilities per 100,000 people
- 55% population-pressure + 45% facility-rate-deficit screening index
- district priority ranking

### 4. Network Accessibility
Requires an imported LineString / MultiLineString road network.
- select origin and destination on map
- nearest network vertex snapping
- Dijkstra shortest-distance route
- route GeoJSON export
- does not yet apply one-way, speed or turn restrictions

## Bundled SUO data
- sempadan_daerah_selangor.geojson
- label_daerah_selangor.geojson
- sempadan_pbt_selangor_2024.geojson
- label_pbt_selangor_2024.geojson
- official DOSM Selangor district totals 2020–2025

## Deployment
Replace repository root `index.html`.

GitHub Pages:
https://faeiruzrusman.github.io/spatial-analytics/

## Next integration
- verified health / police / fire / school point layers
- road network from the 3D GeoPortal
- GeoPortal handoff
- population growth
- Site Suitability
- Flood Exposure
