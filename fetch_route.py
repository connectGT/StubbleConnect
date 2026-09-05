import urllib.request
import json

routes = [
    {"id": "TRK-201", "start": "74.945,30.211", "end": "75.088,29.988"},
    {"id": "TRK-405", "start": "75.390,29.990", "end": "74.945,30.211"},
    {"id": "TRK-708", "start": "75.240,30.270", "end": "75.000,30.150"}
]

results = {}
for r in routes:
    url = f"http://router.project-osrm.org/route/v1/driving/{r['start']};{r['end']}?overview=full&geometries=geojson"
    try:
        req = urllib.request.urlopen(url)
        data = json.loads(req.read())
        # OSRM returns [lon, lat], Leaflet wants [lat, lon]
        coords = data['routes'][0]['geometry']['coordinates']
        latlngs = [[c[1], c[0]] for c in coords]
        
        # Calculate approximate duration in seconds
        duration = data['routes'][0]['duration']
        
        results[r['id']] = {
            "path": latlngs,
            "duration": duration
        }
        print(f"Fetched {r['id']} with {len(latlngs)} points, duration: {duration}s")
    except Exception as e:
        print(f"Error fetching {r['id']}: {e}")

with open('route_coords.json', 'w') as f:
    json.dump(results, f)
