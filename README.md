# SUO Spatial Analytics Engine v2.0

This version restructures Spatial Analytics as an enterprise-style analytics workspace rather than a simple GIS viewer.

## Architecture

- Data Manager
- Analysis Manager
- Workflow Manager
- Result Manager / UI
- History Manager
- Export Manager
- Urban Planning AI Insight panel

## Functional Phase 1 modules

1. Population Density
2. Facility Accessibility
3. Urban Service Gap

## Planned Analysis Library

- Population Growth
- Public Transport Accessibility
- Open Space Accessibility
- Development Pressure
- Urban Change
- Site Suitability
- TOD Potential
- Development Constraint
- Flood Exposure
- KSAS Conflict

## Technology

- Leaflet
- Turf.js
- ES Modules
- OpenStreetMap
- Browser-side analytics
- LocalStorage for analysis history
- GeoJSON import/export

## Repository Deployment

Upload all files and folders to the root of:

`https://github.com/FaeiruzRusman/spatial-analytics`

GitHub Pages URL:

`https://faeiruzrusman.github.io/spatial-analytics/`

## Important

The current Phase 1 population and facility data are synthetic demonstration datasets.

Before production use, replace them with verified:
- DOSM population data
- PBT / district boundaries
- Hospitals / clinics
- Schools
- Police / fire facilities
- Land-use / planning datasets

## Portal Position

SUO Portal
→ Urban Intelligence & Analytics
→ Spatial Analytics
→ Spatial Analytics Engine

3D GeoPortal remains under:
SUO Portal
→ Digital Applications
→ 3D GeoPortal (Main Application)

Spatial Analytics results will later be sent to / opened in the 3D GeoPortal.
