import { useEffect, useRef } from "react";
import L from "leaflet";

export default function MapSection({ cityMarkers, coordinates, tco2e, isDataReady }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layerGroupRef = useRef(L.layerGroup());

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    mapInstanceRef.current = L.map(mapContainerRef.current, {
      center: [44.837789, -0.57918],
      zoom: 12,
      scrollWheelZoom: false
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap'
    }).addTo(mapInstanceRef.current);

    layerGroupRef.current.addTo(mapInstanceRef.current);

    setTimeout(() => {
      mapInstanceRef.current?.invalidateSize();
    }, 500);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const lg = layerGroupRef.current;
    lg.clearLayers();

    if (Array.isArray(cityMarkers)) {
      cityMarkers.forEach(({ name, count, co2, coords }) => {
        if (!coords || coords[0] === 0) return;
        L.circle(coords, { color: "olive", fillColor: "olive", fillOpacity: 0.3, radius: 1000 })
          .bindPopup(`<b>Ville: ${name}</b><br>Utilisateurs: ${count}<br>CO2: ${co2?.toFixed(4) ?? "?"}`).addTo(lg);
      });
    }

    if (coordinates?.length === 2 && coordinates[0] !== 0) {
      const size = 0.002;
      L.polygon([
        [coordinates[0] + size, coordinates[1]],
        [coordinates[0] - size, coordinates[1] - size],
        [coordinates[0] - size, coordinates[1] + size]
      ], { color: "green", fillColor: "green", fillOpacity: 0.8, weight: 3 })
        .bindPopup(`<b>Impact Personnel</b><br>Total: ${tco2e?.tco2e_total?.toFixed(4) ?? "?"} tCO2`).addTo(lg);
    }

    if (lg.getLayers().length > 0) {
      try { mapInstanceRef.current.fitBounds(lg.getBounds().pad(0.1)); } catch (e) {}
    }
  }, [cityMarkers, coordinates, isDataReady, tco2e.tco2e_total]);

  return (
    <div className="card bg-white shadow-xl rounded-lg overflow-hidden" style={{ height: '500px', zIndex: 1 }}>
      <div ref={mapContainerRef} style={{ height: '100%', width: '100%' }}></div>
    </div>
  );
}