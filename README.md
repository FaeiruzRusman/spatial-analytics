# SUO Spatial Analytics Engine v4.1.3 DISTRICT FIX

Fixes missing Hulu Langat and Hulu Selangor results.

Cause:
OpenDOSM official district names are:
- Ulu Langat
- Ulu Selangor

The map centroid lookup previously only contained:
- Hulu Langat
- Hulu Selangor

v4.1.3 adds aliases for both official DOSM names while displaying the preferred portal labels:
- Hulu Langat
- Hulu Selangor

The official source names are still preserved in the popup for traceability.
