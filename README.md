# SUO Spatial Analytics Engine v4.1 DATA

## Main change
v4.1 adds live integration with the official OpenDOSM Administrative District Population CSV.

Official dataset:
https://storage.dosm.gov.my/population/population_district.csv

The engine filters:
- state = Selangor
- sex = both
- age = overall
- ethnicity = overall
- latest available date in the dataset

## New functional module
DOSM District Population

The statistical values are official DOSM/OpenDOSM data fetched live in the browser.

## Geometry note
OpenDOSM's population table is statistical/tabular data and does not include district polygon geometry.
v4.1 therefore uses representative district centroid coordinates only for temporary visualisation.
Do NOT treat these centroid symbols as official district boundaries.

The next production step is to connect a verified Selangor district/PBT polygon dataset and join DOSM population records to those polygons.

## Existing functionality
- Population Density (synthetic spatial demo)
- Facility Accessibility (synthetic facility demo)
- Urban Service Gap (synthetic spatial demo)
- Data Manager
- Workflow console
- results / charts / AI insight
- history
- GeoJSON export
- report export
- measure / basemap / locate / fullscreen / print
- GeoPortal handoff placeholder

## Deployment
Replace the repository root `index.html` with this v4.1 file.

GitHub Pages:
https://faeiruzrusman.github.io/spatial-analytics/
