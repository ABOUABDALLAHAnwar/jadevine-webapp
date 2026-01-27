import { useState, useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import confetti from "canvas-confetti"; // À installer via npm install canvas-confetti
import Header from "./components/Header";
import DashboardGrid from "./components/DashboardGrid";
import { useActions } from "./hooks/useActions";
import { openFormPopup } from "./utils/openFormPopup";
import ContributionDonut from "./components/ContributionDonut";
import OnboardingPage from "./pages/OnboardingPage";

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
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [cityMarkers, setCityMarkers] = useState([]);

  // --- FONCTION DE RAFRAÎCHISSEMENT SANS RELOAD ---
  const refreshUserData = async () => {
    try {
      const res = await fetch("https://jadevinebackend-production.up.railway.app/get_dashboard_snapshot", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch snapshot");
      const data = await res.json();
      setProfile(data.profile);
      setCoordinates(data.coordinates);
      setTco2e(data.tco2e);
      setContributions(data.contributions);
      setBadges(data.badges);
    } catch (err) {
      console.error("Erreur Snapshot User:", err);
    }
  };

  const celebrate = () => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#808000', '#2ecc71', '#f1c40f']
    });
  };

  // --- 1. FETCH INITIAL ---
  useEffect(() => {
    fetchActions();
    refreshUserData();
  }, []);

  // --- 7. FETCH CITY DATA ---
  useEffect(() => {
    const fetchCityData = async () => {
      try {
        const res = await fetch("https://jadevinebackend-production.up.railway.app/get_cached_city_markers", { credentials: "include" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setCityMarkers(data.filter(m => m.coords[0] !== 0 && m.coords[1] !== 0));
      } catch (err) {
        console.error("Error in fetchCityData:", err);
      }
    };
    fetchCityData();
  }, []);

  // --- FONCTION OPEN ACTION POPUP (VERSION COMPLÈTE) ---
  const openActionPopup = async () => {
    try {
      const res = await fetch("https://jadevinebackend-production.up.railway.app/all_actions_names", { credentials: "include" });
      const actionsList = await res.json();
      const foodOptions = ["beef", "lamb", "pork", "veal", "chicken", "fish", "cheese", "vegetarian", "vegan"];

      openFormPopup(
        "Choisir Action",
        [{ name: "action", placeholder: "Sélectionnez l'action", type: "select", options: actionsList }],
        (values, popup) => {
          const selected = values.action;
          popup.close();

          // 1. TRANSPORT
          if (selected === "reduce_car_use_bicycle" || selected === "reduce_car_use_public_transport") {
            openFormPopup("Détails Trajet", [
              { name: "address_a", placeholder: "Adresse de départ (A)", type: "text" },
              { name: "address_b", placeholder: "Adresse d'arrivée (B)", type: "text" },
              { name: "type", placeholder: "Type de voiture remplacée", type: "select", options: ["petite", "moyenne", "grande"] }
            ], async (v2, p2) => {
              const res2 = await fetch("https://jadevinebackend-production.up.railway.app/add_user_actions", {
                method: "POST", credentials: "include", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: selected, info: v2 })
              });
              if (res2.ok) {
                p2.close();
                celebrate();
                fetchActions();
                refreshUserData();
              }
            });
          }

          // 2. RÉGIME ALIMENTAIRE
          else if (selected === "plant_based_diet") {
            openFormPopup("Combien de repas ?", [{ name: "nb", placeholder: "Nombre de repas (1-5)", type: "number" }], (v2, p2) => {
              const nb = Math.min(Math.max(parseInt(v2.nb) || 1, 1), 5);
              p2.close();
              const mealFields = [];
              for(let i=0; i<nb; i++) {
                mealFields.push({ name: `r_${i}`, placeholder: `REPAS ${i+1} : Aliment ÉVITÉ`, type: "select", options: foodOptions });
                mealFields.push({ name: `c_${i}`, placeholder: `REPAS ${i+1} : Aliment CONSOMMÉ`, type: "select", options: foodOptions });
              }
              openFormPopup("Détails des repas", mealFields, async (v3, p3) => {
                const replaced = []; const consumed = [];
                for(let i=0; i<nb; i++) { replaced.push(v3[`r_${i}`]); consumed.push(v3[`c_${i}`]); }
                const res2 = await fetch("https://jadevinebackend-production.up.railway.app/add_user_actions", {
                  method: "POST", credentials: "include", headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ name: selected, info: { meals_replaced: replaced, meals_consumed: consumed } })
                });
                if (res2.ok) { p3.close(); celebrate(); fetchActions(); refreshUserData(); }
              });
            });
          }

          // 3. DÉCHETS
          else if (selected === "waste_reduction") {
            openFormPopup("Bilan Déchets", [
              { name: "bulk_done", placeholder: "Avez-vous acheté en vrac ? (Oui/Non)", type: "select", options: ["Oui", "Non"] },
              { name: "is_family", placeholder: "Format foyer familial ? (Oui/Non)", type: "select", options: ["Oui", "Non"] },
              { name: "compost_buckets", placeholder: "Nombre de seaux de compost", type: "number" },
              { name: "recycling_done", placeholder: "Avez-vous effectué le tri ? (Oui/Non)", type: "select", options: ["Oui", "Non"] },
              { name: "recycling_bin_size", placeholder: "Taille du bac (small/large)", type: "select", options: ["small", "large"] },
              { name: "glass_trips", placeholder: "Nombre de trajets au bac à verre", type: "number" }
            ], async (v2, p2) => {
              const info = {
                ...v2,
                bulk_done: v2.bulk_done === "Oui",
                is_family: v2.is_family === "Oui",
                recycling_done: v2.recycling_done === "Oui",
                compost_buckets: parseInt(v2.compost_buckets) || 0,
                glass_trips: parseInt(v2.glass_trips) || 0
              };
              const res2 = await fetch("https://jadevinebackend-production.up.railway.app/add_user_actions", {
                method: "POST", credentials: "include", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: selected, info: info })
              });
              if (res2.ok) { p2.close(); celebrate(); fetchActions(); refreshUserData(); }
            });
          }

          // 4. ARBRES
          else if (selected === "tree_planting") {
            openFormPopup("Planter des arbres", [{ name: "nb", placeholder: "Combien d'arbres ?", type: "number" }], async (v2, p2) => {
              const res2 = await fetch("https://jadevinebackend-production.up.railway.app/add_user_actions", {
                method: "POST", credentials: "include", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: selected, info: parseInt(v2.nb) || 0 })
              });
              if (res2.ok) { p2.close(); celebrate(); fetchActions(); refreshUserData(); }
            });
          }

          // 5. ENERGIE
          else if (selected === "renewable_energy") {
            openFormPopup("Énergie Renouvelable", [{ name: "type", placeholder: "Type de logement", type: "select", options: ["apartment", "house"] }], async (v2, p2) => {
              const res2 = await fetch("https://jadevinebackend-production.up.railway.app/add_user_actions", {
                method: "POST", credentials: "include", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: selected, info: v2.type })
              });
              if (res2.ok) { p2.close(); celebrate(); fetchActions(); refreshUserData(); }
            });
          }
        }
      );
    } catch (err) { console.error(err); }
  };

  const openProfilePopup = () => openFormPopup(
    "Update Profile",
    [
      { name: "name", placeholder: "Nom" },
      { name: "position", placeholder: "Poste" },
      { name: "about", placeholder: "À propos" },
      { name: "age", placeholder: "Âge", type: "number" },
      { name: "country", placeholder: "Pays" },
      { name: "address", placeholder: "Adresse" },
      { name: "phone", placeholder: "Téléphone" }
    ],
    async (values, popup) => {
      try {
        const res = await fetch("https://jadevinebackend-production.up.railway.app/initialise_user_profiles", {
          method: "POST", credentials: 'include', headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values)
        });
        if (res.ok) { popup.close(); refreshUserData(); }
      } catch { alert("Erreur"); }
    },
    profile
  );

  const handleLogout = () => fetch("https://jadevinebackend-production.up.railway.app/logout", { method: "GET", credentials: "include" })
    .then(() => window.location.reload()).catch(console.error);

  // --- INITIALISATION CARTE ---
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;
    mapInstanceRef.current = L.map(mapContainerRef.current, { center: [44.837789, -0.57918], zoom: 12, scrollWheelZoom: false });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap' }).addTo(mapInstanceRef.current);
    layerGroupRef.current.addTo(mapInstanceRef.current);
    const invalidate = () => mapInstanceRef.current?.invalidateSize();
    setTimeout(invalidate, 100); setTimeout(invalidate, 500);
    return () => { if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null; } };
  }, []);

  // --- MISE À JOUR FORMES ---
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
      L.polygon([[coordinates[0] + size, coordinates[1]], [coordinates[0] - size, coordinates[1] - size], [coordinates[0] - size, coordinates[1] + size]], { color: "green", fillColor: "green", fillOpacity: 0.8, weight: 3 })
        .bindPopup(`<b>Impact Personnel</b><br>Total: ${tco2e?.tco2e_total?.toFixed(4) ?? "?"} tCO2`).addTo(lg);
    }
    if (lg.getLayers().length > 0) { try { mapInstanceRef.current.fitBounds(lg.getBounds().pad(0.1)); } catch (e) {} }
  }, [cityMarkers, coordinates, tco2e]);

  return (
    <div className="min-h-screen bg-cover bg-center bg-fixed" style={{ backgroundImage: "url('https://thumbs.dreamstime.com/b/misty-forest-scene-serene-green-nature-background-ideal-relaxation-documentaries-tones-soft-light-atmosphere-themes-376070078.jpg')" }}>
      <div className="absolute inset-0 bg-black/40"></div>
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header onAddAction={openActionPopup} onUpdateProfile={openProfilePopup} onLogout={handleLogout} onOnboarding={() => setShowOnboarding(true)} />
        <main className="flex-1 p-6">
          <DashboardGrid>
            <div className="card bg-white shadow-xl rounded-lg overflow-hidden" style={{ height: '500px', zIndex: 1 }}>
              <div ref={mapContainerRef} style={{ height: '100%', width: '100%' }}></div>
            </div>
            <div className="card bg-white/90 backdrop-blur-sm shadow-xl p-6 flex flex-col justify-between h-full overflow-y-auto">
              <div>
                <h2 className="text-4xl font-extrabold mb-6" style={{ color: 'olive' }}>Profil Utilisateur</h2>
                <p className="mb-1"><strong>Nom:</strong> {profile.name}</p>
                <p className="mb-1"><strong>Poste:</strong> {profile.position}</p>
                <p className="mb-1"><strong>À propos:</strong> {profile.about}</p>
                <p className="mb-1"><strong>Âge:</strong> {profile.age}</p>
                <p className="mb-1"><strong>Pays:</strong> {profile.country}</p>
                <p className="mb-1"><strong>Adresse:</strong> {profile.address}</p>
                <p className="mb-1"><strong>Téléphone:</strong> {profile.phone}</p>
                <p className="my-4"><strong>Coordonnées:</strong> {coordinates[0]}, {coordinates[1]}</p>
                <div className="my-8">
                  <table style={{ margin: "0 auto", borderCollapse: "separate", borderSpacing: "60px 0" }}>
                    <tbody>
                      <tr style={{ textAlign: "center" }}>
                        <td style={{ verticalAlign: "top" }}>
                          <div className="font-semibold mb-2 text-xs uppercase text-gray-400">Badge actuel</div>
                          {badges.current_badge?.image && (
                            <img src={`http://localhost:8001${badges.current_badge.image}`} alt="current" style={{ width: "2.5cm", height: "2.5cm", objectFit: "contain" }} />
                          )}
                        </td>
                        <td style={{ verticalAlign: "top" }}>
                          <div className="font-semibold mb-2 text-xs uppercase text-gray-400">Prochain badge</div>
                          {badges.next_badge?.image && (
                            <img src={`http://localhost:8001${badges.next_badge.image}`} alt="next" style={{ width: "2.5cm", height: "2.5cm", objectFit: "contain", opacity: 0.4 }} />
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <progress className="w-full h-4 mt-6 block" value={badges.progress_percent || 0} max={100} style={{ accentColor: "olive" }} />
                  <p className="text-center mt-4 font-bold text-lg">{(badges.progress_percent || 0).toFixed(1)} % vers le prochain badge</p>
                </div>
                <h2 className="text-4xl font-extrabold mb-6" style={{ color: 'olive' }}>Bilan d'activité</h2>
                <p className="font-bold text-green-600 mb-4">CO₂ évité: {(tco2e.tco2e_total || 0).toFixed(6)} t</p>
                <p className="font-bold mb-4">Récompenses générées: {(tco2e.monney || 0).toFixed(2)} €</p>
                <div className="flex justify-center items-center my-8">
                  <ContributionDonut data={contributions} />
                </div>
              </div>
              <div className="mt-auto">
                <p className="font-bold text-2xl" style={{ color: 'olive' }}> "L'environnementalisme sans lutte des classes, c'est du jardinage !" Chico Mendes </p>
              </div>
            </div>
          </DashboardGrid>
        </main>
        {showOnboarding && <OnboardingPage onClose={() => setShowOnboarding(false)} />}
      </div>
    </div>
  );
}