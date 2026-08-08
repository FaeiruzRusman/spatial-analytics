# SUO Spatial Analytics Engine v5.1.2 — Multimodal Rail Routing

## Fixed
Previous Network Accessibility routing depended on disconnected rail-line geometries, so routes commonly worked only when origin and destination were on the same rail line/mode.

v5.1.2 routes using the bundled 234 station records as a multimodal transit graph.

## Graph logic
- Each line-specific station record is a graph node.
- Consecutive records on the same `line_name` are connected as ride edges.
- Records with the same normalized `station_name` but different lines are connected as interchange / transfer edges.
- Dijkstra finds the lowest-distance-equivalent multimodal path.
- A configurable transfer penalty discourages unnecessary transfers.

## Result
- rail distance
- number of transfers
- number of modes
- stations in path
- modes used
- lines used
- interchange stations
- route segments styled by rail mode
- transfer segments shown as dashed white links

## Supported multimodal combinations
Where interchange station records exist in the supplied station dataset, routes can combine:
- MRT
- LRT
- KTM Komuter
- ERL
- KL Monorail
- BRT

## Limitation
This is topology/distance routing.
It does not yet model timetable, frequency, fare, train speed, waiting time, or verified walking transfers between nearby stations with different names.
