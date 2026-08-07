# SUO Spatial Analytics Engine v4.1.1 HOTFIX

Fixes the DOSM District Population analysis failure on GitHub Pages.

## What changed
- Official `api.data.gov.my` OpenAPI is now the PRIMARY data source.
- Official OpenDOSM CSV is the FALLBACK source.
- No automatic DOSM request on initial page load.
- DOSM sync is now manual through Data Manager.
- Processing Console displays the actual fetch/parse error.
- Progress resets correctly after failure.
- Accepts `sex=both` or `sex=overall` for compatibility with dataset revisions.

## Test
1. Upload this `index.html` to repository root.
2. Hard refresh the GitHub Pages site (Ctrl+F5).
3. Open Data Manager.
4. Click `Connect OpenDOSM Population`.
5. Confirm status shows `Live`.
6. Run `DOSM District Population`.

Official dataset:
https://data.gov.my/data-catalogue/population_district
