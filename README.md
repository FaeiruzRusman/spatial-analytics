# SUO Spatial Analytics Engine v4.1.2 BUNDLED

This hotfix removes the browser/CORS dependency for DOSM population analysis.

## Official data bundled
Source:
https://storage.dosm.gov.my/population/population_district.csv

Filter:
- state = Selangor
- sex = both
- age = overall
- ethnicity = overall

Years bundled:
2020, 2021, 2022, 2023, 2024, 2025

Records bundled:
54 records = 9 Selangor administrative districts x 6 years.

## Behaviour
- The DOSM module works without any browser fetch.
- Latest available year is selected automatically.
- Official values are embedded directly inside `index.html`.
- A CSV audit copy is also included in this ZIP.
- District map symbols remain representative centroids, not official boundary geometry.

## Next step
v4.2 should connect verified district polygons and join these official DOSM records to the polygons.
