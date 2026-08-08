# SUO Spatial Analytics Engine v5.1.1 — Real Data Integration

This build extends v5.1 Enterprise UX and bundles the real datasets supplied for the SUO GeoPortal.

## Bundled operational datasets
- Selangor Rail Network: 15 line features
- Selangor Rail Stations: 234 station points
- Sekolah Negeri Selangor: 945 school points
- IPK & IPD Selangor: 17 points
- Kemudahan Kesihatan Selangor: 87 points
- SUO District Boundary: 9 districts
- SUO PBT Boundary 2024: 12 PBT
- DOSM Selangor District Population 2020–2025

## Rail metadata
Source status: User checked and finalized
Portal CRS: EPSG:4326
Exact duplicate station records removed for portal display: 20

## Behaviour
Facility Accessibility and Urban Service Gap can now select bundled health, school, police and rail-station point layers directly.
Network Accessibility can select the bundled rail network directly.
Additional GeoJSON layers can still be imported through Data Manager.

## Data-quality note
The engine preserves the attributes/status fields in the supplied source data. A bundled dataset being available does not override source-level verification flags such as `PERLU_SEMAKAN`.
