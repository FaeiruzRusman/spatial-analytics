# SUO Spatial Analytics Engine v4.2 — SUO BOUNDARIES

Population Density now uses the same district boundary dataset supplied for / used by the SUO GeoPortal.

## Embedded SUO spatial data
- sempadan_daerah_selangor.geojson — 9 district polygons
- label_daerah_selangor.geojson — 9 district label points
- sempadan_pbt_selangor_2024.geojson — 12 PBT polygons
- label_pbt_selangor_2024.geojson — 12 PBT label points

All four are bundled directly into `index.html` for stable GitHub Pages deployment.

## Population Density
Population:
Official bundled DOSM/OpenDOSM district population 2020–2025

Geometry:
SUO district polygons from `sempadan_daerah_selangor.geojson`

Join:
DOSM district name -> canonical district name -> `web_name`

Density:
population / district area (km²)

The SUO layer `web_area` is converted from hectares to km² (`web_area / 100`).
Turf geodesic area is retained as fallback if `web_area` is unavailable.

## Result
- 9 district polygons
- official DOSM population
- persons per km²
- quartile choropleth
- total population
- overall density
- highest / lowest density district
- map popup: population, area, density
- same district geometry as SUO GeoPortal

## PBT
The 12-PBT boundary and label datasets are already bundled in v4.2 for the next PBT-level analytics modules.
