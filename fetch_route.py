import urllib.request
import json

# Start: Bathinda (30.211, 74.945)
# End: Talwandi Sabo (29.988, 75.088)
# OSRM expects: lon,lat
url = 'http://router.project-osrm.org/route/v1/driving/74.945,30.211;75.088,29.988?overview=full&geometries=geojson'

try:
    with urllib.request.urlopen(url) as response:
        data = json.loads(response.read().decode())
        coords = data['routes'][0]['geometry']['coordinates']
        # OSRM gives [lon, lat], we need [lat, lon]
        route_path = [[c[1], c[0]] for c in coords]
        
        # Save to a file we can inspect
        with open('route_coords.json', 'w') as f:
            json.dump(route_path, f)
        print(f'Successfully fetched {len(route_path)} coordinates along real roads.')
except Exception as e:
    print(f'Error: {e}')
