import numpy as np
from sklearn.cluster import DBSCAN
from typing import List, Dict

def cluster_farms_dbscan(
    farms: List[Dict],
    eps_km: float = 8.0,
    min_samples: int = 3
) -> List[Dict]:
    """
    Clusters registered farms into aggregated biomass collection zones
    using Haversine metric (great circle distance on Earth).
    
    eps_km: maximum distance between two farms to be considered in the same cluster (8km default).
    min_samples: minimum number of farms required to form a viable logistics cluster.
    """
    if not farms:
        return []

    # Earth radius in kilometers
    EARTH_RADIUS_KM = 6371.0088
    eps_radians = eps_km / EARTH_RADIUS_KM

    # Extract coordinates in radians for Haversine
    coords = np.array([
        [np.radians(f["latitude"]), np.radians(f["longitude"])]
        for f in farms
    ])

    # Run DBSCAN
    db = DBSCAN(eps=eps_radians, min_samples=min_samples, metric='haversine')
    labels = db.fit_predict(coords)

    # Group farms by cluster label
    clusters = {}
    for idx, label in enumerate(labels):
        if label == -1:
            # Noise points / standalone farms
            continue
        if label not in clusters:
            clusters[label] = []
        clusters[label].append(farms[idx])

    results = []
    for cluster_id, cluster_farms in clusters.items():
        total_biomass = sum(f.get("biomass_tonnes", 0.0) for f in cluster_farms)
        center_lat = np.mean([f["latitude"] for f in cluster_farms])
        center_lng = np.mean([f["longitude"] for f in cluster_farms])

        results.append({
            "cluster_id": f"cluster-{cluster_id + 1}",
            "farms_count": len(cluster_farms),
            "total_biomass_tonnes": round(total_biomass, 1),
            "center": [round(center_lat, 4), round(center_lng, 4)],
            "farms": cluster_farms
        })

    return results

if __name__ == "__main__":
    sample_farms = [
        {"id": 1, "name": "Talwandi Farm A", "latitude": 30.23, "longitude": 74.94, "biomass_tonnes": 6.2},
        {"id": 2, "name": "Bhucho Farm B", "latitude": 30.28, "longitude": 74.97, "biomass_tonnes": 4.8},
        {"id": 3, "name": "Kotshamir Farm C", "latitude": 30.22, "longitude": 74.98, "biomass_tonnes": 5.9},
        {"id": 4, "name": "Gill Patti Farm D", "latitude": 30.25, "longitude": 75.03, "biomass_tonnes": 8.1},
    ]
    clusters = cluster_farms_dbscan(sample_farms)
    print(f"Generated {len(clusters)} clusters from {len(sample_farms)} farms.")
