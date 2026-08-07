# SUO Spatial Analytics Engine v1.0

Standalone Phase 1 analytics workspace for the Selangor Urban Observatory portal.

Included modules:
- Population Density
- Facility Accessibility
- Urban Service Gap

Technology:
- Leaflet
- Turf.js
- OpenStreetMap
- Browser-side spatial processing
- GeoJSON import/export

Important:
The current population and facility layers are synthetic demo datasets.
Replace `populationGeoJSON` and `facilityGeoJSON` in `app.js` with verified SUO / DOSM datasets before production.

Portal position:
SUO Portal → Urban Intelligence & Analytics → Spatial Analytics → Launch Spatial Analytics Engine

The 3D GeoPortal remains under Digital Applications as the main spatial visualisation application.

Recommended next development:
- Connect real DOSM population data
- Connect verified hospital / school / police datasets
- PBT / district filtering
- Result history
- Site Suitability
- Change Detection
- PostGIS / Python backend for heavier analytics
- View Result in 3D GeoPortal
