# SUO Spatial Analytics Engine v5.1.3 — Track-Based Multimodal Rail

## Why v5.1.2 route looked illogical
v5.1.2 connected station records in their GeoJSON record order.
That created straight station-to-station edges and could generate visually incorrect routes when record order did not match the physical rail alignment.

## v5.1.3 fix
Routing now uses `rail_network_final.geojson` as the physical graph.

- Every rail track vertex is a graph node.
- Consecutive vertices along each finalized rail feature are ride edges.
- Every rail station is snapped to the nearest compatible physical rail line.
- Duplicate station-name records on different lines create interchange transfer edges.
- Dijkstra routing runs across the physical track graph plus interchange edges.
- Result geometry therefore follows the rail tracks instead of drawing artificial straight station connections.

## Station-line to physical-network mapping
Examples:
- MRT Kajang -> MRT 1 Sungai Buloh–Kajang
- MRT Putrajaya -> MRT 2 Sungai Buloh–Putrajaya
- LRT Shah Alam -> LRT 3 Damansara–Johan Setia
- LRT Kelana Jaya -> Gombak / Kelana Jaya / Extension physical segments
- KLIA Transit / Ekspres -> Express Rail Link
- KTM Port Klang / Seremban -> KTM Double Track
- KL Monorail -> KL Monorail
- BRT Sunway -> BRT Sunway

## Result symbology
- Solid coloured line = actual physical rail track segment
- White dashed line = interchange transfer
- Grey short dashed line = station-to-track snap
