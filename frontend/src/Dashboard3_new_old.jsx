import { useState, useEffect, useRef } from "react";
import { handleOpenActionPopup } from "./dashboard_components/ActionPopups";
import ProfileSection from "./dashboard_components/ProfileSection";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import confetti from "canvas-confetti";
import Header from "./components/Header";
import DashboardGrid from "./components/DashboardGrid";
import { useActions } from "./hooks/useActions";
import { openFormPopup } from "./utils/openFormPopup";
import OnboardingPage from "./pages/OnboardingPage";
import LoadingScreen from "./components/LoadingScreen";

import { ACTION_DISPLAY_NAMES, FOOD_OPTIONS, BACKEND_URL } from "./dashboard_components/ActionConfigs";

export default function Dashboard() {
  const { actions, fetchActions } = useActions();
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layerGroupRef = useRef(L.layerGroup());

  const [profile, setProfile] = useState({});
  const [coordinates, setCoordinates] = useState([0, 0]);
  const [tco2e, setTco2e] = useState({ tco2e_total: 0, monney: 0 });
  const [contributions, setContributions] = useState({});
  const [badges, setBadges] = useState({ current_badge: null, next_badge: null, progress_percent: 0 });
  const [cityMarkers, setCityMarkers] = useState([]);

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isDataReady, setIsDataReady] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const refreshUserData = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/get_dashboard_snapshot`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch snapshot");
      const data = await res.json();
      setProfile(data.profile || {});
      setCoordinates(data.coordinates || [0, 0]);
      setTco2e(data.tco2e || { tco2e_total: 0, monney: 0 });
      setContributions(data.contributions || {});
      setBadges(data.badges || { current_badge: null, next_badge: null, progress_percent: 0 });
    } catch (err) { console.error("Erreur Snapshot User:", err); }
  };

  const fetchCityData = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/get_cached_city_markers`, { credentials: "include" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setCityMarkers(data.filter(m => m.coords && m.coords[0] !== 0));
    } catch (err) { console.error("Error in fetchCityData:", err); }
  };

  useEffect(() => {
    let isMounted = true;
    const loaderTimer = setTimeout(() => { if (isMounted && !isDataReady) setIsSyncing(true); }, 2000);
    const initApp = async () => {
      try {
        await Promise.all([fetchActions(), refreshUserData(), fetchCityData()]);
        if (isMounted) { setIsDataReady(true); setIsSyncing(false); clearTimeout(loaderTimer); }
      } catch (e) { if (isMounted) setIsDataReady(true); }
    };
    initApp();
    return () => { isMounted = false; clearTimeout(loaderTimer); };
  }, []);

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;
    mapInstanceRef.current = L.map(mapContainerRef.current, { center: [44.837789, -0.57918], zoom: 12, scrollWheelZoom: false });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap' }).addTo(mapInstanceRef.current);
    layerGroupRef.current.addTo(mapInstanceRef.current);
    return () => { if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null; } };
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
      L.polygon([[coordinates[0] + size, coordinates[1]], [coordinates[0] - size, coordinates[1] - size], [coordinates[0] - size, coordinates[1] + size]], { color: "green", fillColor: "green", fillOpacity: 0.8, weight: 3 }).addTo(lg);
    }
  }, [cityMarkers, coordinates, isDataReady, tco2e.tco2e_total]);

  const celebrate = () => {
    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#808000', '#2ecc71', '#f1c40f'] });
  };

  const openActionPopup = () => handleOpenActionPopup(fetchActions, refreshUserData, celebrate);

  const openProfilePopup = () => openFormPopup("Update Profile", [
      { name: "name", placeholder: "Nom" }, { name: "position", placeholder: "Poste" },
      { name: "about", placeholder: "À propos" }, { name: "age", placeholder: "Âge", type: "number" },
      { name: "country", placeholder: "Pays" }, { name: "address", placeholder: "Adresse", type: "address" },
      { name: "phone", placeholder: "Téléphone" }
    ],
    async (values, popup) => {
      try {
        const res = await fetch(`${BACKEND_URL}/initialise_user_profiles`, { method: "POST", credentials: 'include', headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });
        if (res.ok) { popup.close(); refreshUserData(); }
      } catch { alert("Erreur"); }
    }, profile
  );

  return (
    <div className="relative min-h-screen w-full">
      {isSyncing && !isDataReady && <div className="fixed inset-0 z-[9999]"><LoadingScreen /></div>}
      {!isDataReady && !isSyncing && <div className="fixed inset-0 z-[9998] bg-[#050a09]" />}

      <div className={`min-h-screen bg-cover bg-center bg-fixed transition-opacity duration-500 ${isDataReady ? 'opacity-100' : 'opacity-0'}`}
           style={{ backgroundImage: "url('https://thumbs.dreamstime.com/b/misty-forest-scene-serene-green-nature-background-ideal-relaxation-documentaries-tones-soft-light-atmosphere-themes-376070078.jpg')" }}>
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-10 flex flex-col min-h-screen">
          <Header onAddAction={openActionPopup} onUpdateProfile={openProfilePopup} onLogout={() => window.location.reload()} onOnboarding={() => setShowOnboarding(true)} />
          <main className="flex-1 p-6">
            <DashboardGrid>
              <div className="card bg-white shadow-xl rounded-lg overflow-hidden" style={{ height: '500px', zIndex: 1 }}>
                <div ref={mapContainerRef} style={{ height: '100%', width: '100%' }}></div>
              </div>
              <ProfileSection profile={profile} badges={badges} tco2e={tco2e} contributions={contributions} />
            </DashboardGrid>
          </main>
          {showOnboarding && <OnboardingPage onClose={() => setShowOnboarding(false)} />}
        </div>
      </div>
    </div>
  );
}