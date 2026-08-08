# SUO Spatial Analytics Engine v5.1.2a — HOTFIX

This hotfix fixes the landing-page lock in v5.1.2.

## Root cause
A malformed JavaScript fragment remained after replacing the route-status function:

`· Destination: ${destLatLng?...}`

That caused the browser to stop parsing the main application script.
The landing page HTML/CSS still rendered, but none of the workspace button handlers were initialized.

## Fixed
- Removed the malformed JavaScript residue.
- Preserved the v5.1.2 multimodal rail-routing logic.
- Validated the final inline JavaScript with `node --check` before packaging.

## Expected behaviour
- Landing page buttons open the workspace.
- Analysis Toolbox works.
- Data Manager works.
- DOSM / Facility / Urban Service Gap modules remain available.
- Network Accessibility uses multimodal station/interchange routing.
