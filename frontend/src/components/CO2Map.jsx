import { useEffect } from "react";
import L from "leaflet";

export default function CO2Map({ actions }) {
  useEffect(() => {
    if (!actions.length) return;

    const map = L.map("map", {
      center: [44.8695, -0.545],
      zoom: 13,
      scrollWheelZoom: false,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

    actions.forEach((a) => {
      const color =
        a.impact_co2_kg < 1000 ? "orange" :
        a.impact_co2_kg < 2000 ? "yellowgreen" : "green";

      L.circle([a.lat, a.lon], {
        color,
        fillColor: color,
        fillOpacity: 0.7,
        radius: (a.impact_co2_kg || 0) * 5,
      }).addTo(map);
    });

    return () => map.remove();
  }, [actions]);

  return <div id="map" className="card h-96 bg-white/90 shadow-xl" />;
}
