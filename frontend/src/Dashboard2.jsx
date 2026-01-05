import { useState, useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
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
  const [cityMarkers, setCityMarkers] = useState([]); // Stocke les noms + coordonnées récupérées

  // --- 1. FETCH ACTIONS ---
  useEffect(() => {
    fetchActions();
  }, []);

  // --- 2. FETCH PROFILE ---
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("http://localhost:8001/get_user_profile", { credentials: "include" });
        const data = await res.json();
        setProfile(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProfile();
  }, []);

  // --- 3. FETCH COORDINATES ---
  useEffect(() => {
    const fetchCoordinates = async () => {
      try {
        const res = await fetch("http://localhost:8001/coordinates", { credentials: "include" });
        const data = await res.json();
        console.log("Coordinates fetched:", data); // Debug
        setCoordinates(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCoordinates();
  }, []);

  // --- 4. FETCH TCO2E ---
  useEffect(() => {
    const fetchTco2e = async () => {
      try {
        const res = await fetch("http://localhost:8001/tco2e_total", { credentials: "include" });
        const data = await res.json();
        setTco2e(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchTco2e();
  }, []);

  // --- 5. FETCH CONTRIBUTIONS ---
  useEffect(() => {
    const fetchContributions = async () => {
      try {
        const res = await fetch("http://localhost:8001/tco2e_evite_contributions", { credentials: "include" });
        const data = await res.json();
        setContributions(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchContributions();
  }, []);

  // --- 6. FETCH BADGES ---
  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const res = await fetch("http://localhost:8001/users_badges", { credentials: "include" });
        const data = await res.json();
        if (data && !data.next_badge) data.next_badge = data.current_badge;
        setBadges(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchBadges();
  }, []);

  // --- 7. FETCH CITY DATA & DYNAMIC COORDINATES ---
  useEffect(() => {
    console.log("Starting fetchCityData"); // Debug
    const fetchCityData = async () => {
      try {
        console.log("Fetching /get_dashboard_full_data"); // Debug
        const res = await fetch("http://localhost:8001/get_dashboard_full_data", { credentials: "include" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        console.log("Dashboard full data:", data); // Debug

        // Fallback coords if /get_coordinate fails
        const fallbackCoords = {
          "Bordeaux": [44.837789, -0.57918],
          "Cenon": [44.857, -0.530]
        };

        // Pour chaque ville, on récupère les coordonnées via ta nouvelle route
        const markersWithCoords = await Promise.all(
          data.map(async ([name, count, co2]) => {
            let coords = [0, 0];
            try {
              console.log(`Fetching /get_coordinate/${name}`); // Debug
              const resCoord = await fetch(`http://localhost:8001/get_coordinate/${encodeURIComponent(name)}`, { credentials: "include" });
              if (resCoord.ok) {
                coords = await resCoord.json();
                console.log(`Coords for ${name}:`, coords); // Debug
              } else {
                console.warn(`Failed to fetch coords for ${name}, using fallback`);
                coords = fallbackCoords[name.toLowerCase()] || [0, 0];
              }
            } catch (coordErr) {
              console.warn(`Error fetching coords for ${name}:`, coordErr, "using fallback");
              coords = fallbackCoords[name.toLowerCase()] || [0, 0];
            }
            return { name, count, co2, coords };
          })
        );
        console.log("Final cityMarkers:", markersWithCoords); // Debug
        setCityMarkers(markersWithCoords.filter(m => m.coords[0] !== 0 && m.coords[1] !== 0)); // Only valid
      } catch (err) {
        console.error("Error in fetchCityData:", err);
      }
    };
    fetchCityData();
  }, []);

  // --- FONCTION OPEN ACTION POPUP ---
  const openActionPopup = async () => {
    try {
      const res = await fetch("http://localhost:8001/all_actions_names", { credentials: "include" });
      const actionsList = await res.json();
      openFormPopup(
        "Choisir Action",
        [{ name: "action", placeholder: "Sélectionnez l'action", type: "select", options: actionsList }],
        (values, popup) => {
          const selected = values.action;
          if (selected === "reduce_car_use_bicycle" || selected === "reduce_car_use_public_transport") {
            popup.close();
            openFormPopup(
              "Ajouter Action",
              [
                { name: "address_a", placeholder: "Adresse A", type: "text" },
                { name: "address_b", placeholder: "Adresse B", type: "text" },
                { name: "type", placeholder: "Type de voiture", type: "select", options: ["petite", "moyenne", "grande"] }
              ],
              async (values2, popup2) => {
                try {
                  const res2 = await fetch("http://localhost:8001/add_user_actions", {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name: selected, info: values2 })
                  });
                  if (!res2.ok) throw new Error("Erreur ajout action");
                  popup2.close();
                  fetchActions();
                  window.location.reload();
                } catch {
                  alert("Erreur réseau ou non authentifié");
                }
              }
            );
          } else {
            alert("Action non développée");
          }
        }
      );
    } catch (err) {
      console.error(err);
      alert("Impossible de charger la liste des actions");
    }
  };

  // --- FONCTION OPEN PROFILE POPUP ---
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
        const res = await fetch("http://localhost:8001/initialise_user_profiles", {
          method: "POST",
          credentials: 'include',
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values)
        });
        if (!res.ok) throw new Error("Erreur update profil");
        popup.close();
        setProfile(values);
        window.location.reload();
      } catch {
        alert("Erreur réseau ou non authentifié");
      }
    },
    profile
  );

  const handleLogout = () => fetch("http://localhost:8001/logout", { method: "GET", credentials: "include" })
    .then(() => window.location.reload()).catch(console.error);

  const handleOnboarding = () => setShowOnboarding(true);

  // --- INITIALISATION DE LA CARTE ---
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    console.log("Initializing map"); // Debug
    mapInstanceRef.current = L.map(mapContainerRef.current, {
      center: [44.837789, -0.57918],
      zoom: 12,
      scrollWheelZoom: false
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapInstanceRef.current);

    layerGroupRef.current.addTo(mapInstanceRef.current);

    // Multiple invalidateSize calls for safety
    const invalidate = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    };
    setTimeout(invalidate, 100);
    setTimeout(invalidate, 500);
    setTimeout(invalidate, 1000);
    setTimeout(invalidate, 2000);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // --- MISE À JOUR DES FORMES ---
  useEffect(() => {
    console.log("Updating shapes with:", { cityMarkers, coordinates, tco2e }); // Debug
    if (!mapInstanceRef.current) {
      console.log("Map not ready yet"); // Debug
      return;
    }

    const lg = layerGroupRef.current;
    lg.clearLayers();

    let hasValidLayers = false;

    // 1. Cercles Olive (Villes) - MODIFIÉ : Grand cercle et texte mis à jour
    if (Array.isArray(cityMarkers) && cityMarkers.length > 0) {
      cityMarkers.forEach(({ name, count, co2, coords }) => {
        if (!coords || !Array.isArray(coords) || coords.length !== 2 || coords[0] === 0 || coords[1] === 0) {
          console.warn(`Coordonnées invalides pour la ville: ${name}`, coords);
          return;
        }
        const circle = L.circle(coords, {
          color: "olive",
          fillColor: "olive",
          fillOpacity: 0.3,
          radius: 1000 // Grand cercle de 1km de rayon
        }).bindPopup(`<b>Ville: ${name}</b><br>Nombre d'utilisateurs: ${count}<br>CO2: ${co2?.toFixed?.(4) ?? "?"}`);
        circle.addTo(lg);
        hasValidLayers = true;
        console.log(`Added circle for ${name}`); // Debug
      });
    }

    // 2. Triangle Vert (Impact) - MODIFIÉ : Plus petit triangle
    if (coordinates?.length === 2 && coordinates[0] !== 0 && coordinates[1] !== 0) {
      const lat = coordinates[0];
      const lon = coordinates[1];
      const size = 0.002; // Taille réduite (anciennement 0.005)
      const points = [[lat + size, lon], [lat - size, lon - size], [lat - size, lon + size]];
      const poly = L.polygon(points, {
        color: "green",
        fillColor: "green",
        fillOpacity: 0.8,
        weight: 3
      }).bindPopup(`<b>Impact Personnel</b><br>Total: ${tco2e?.tco2e_total?.toFixed?.(4) ?? "?"} tCO2`);
      poly.addTo(lg);
      hasValidLayers = true;
      console.log("Added personal impact triangle"); // Debug
    }

    // Recentrer la carte si des layers sont ajoutés
    if (lg.getLayers().length > 0) {
      try {
        mapInstanceRef.current.fitBounds(lg.getBounds().pad(0.1));
        console.log("Fit bounds applied"); // Debug
      } catch (e) {
        console.warn("Fit bounds error:", e); // Debug
      }
    }

    // Force invalidate after adding layers
    setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 100);
  }, [cityMarkers, coordinates, tco2e]);

  return (
    <div className="min-h-screen bg-cover bg-center bg-fixed" style={{ backgroundImage: "url('https://thumbs.dreamstime.com/b/misty-forest-scene-serene-green-nature-background-ideal-relaxation-documentaries-tones-soft-light-atmosphere-themes-376070078.jpg')" }}>
      <div className="absolute inset-0 bg-black/40"></div>
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header onAddAction={openActionPopup} onUpdateProfile={openProfilePopup} onLogout={handleLogout} onOnboarding={handleOnboarding} />
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
                          {badges.current_badge && (
                            <img src={`http://localhost:8001${badges.current_badge.image}`} alt="current" style={{ width: "2.5cm", height: "2.5cm", objectFit: "contain" }} />
                          )}
                        </td>
                        <td style={{ verticalAlign: "top" }}>
                          <div className="font-semibold mb-2 text-xs uppercase text-gray-400">Prochain badge</div>
                          {badges.next_badge && (
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



import { useState, useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
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

  // --- 1. FETCH ACTIONS ---
  useEffect(() => {
    fetchActions();
  }, []);

  // --- 2 À 6. FETCH USER DATA (SNAPSHOT CACHÉ) ---
  useEffect(() => {
    const fetchUserSnapshot = async () => {
      try {
        const res = await fetch("http://localhost:8001/get_dashboard_snapshot", { credentials: "include" });
        if (!res.ok) throw new Error("Failed to fetch snapshot");
        const data = await res.json();

        // On dispatch tout d'un coup dans les states existants
        setProfile(data.profile);
        setCoordinates(data.coordinates);
        setTco2e(data.tco2e);
        setContributions(data.contributions);
        setBadges(data.badges);
      } catch (err) {
        console.error("Erreur Snapshot User:", err);
      }
    };
    fetchUserSnapshot();
  }, []);

  // --- 7. FETCH CITY DATA (VERSION CACHÉE ET OPTIMISÉE) ---
  useEffect(() => {
    const fetchCityData = async () => {
      try {
        const res = await fetch("http://localhost:8001/get_cached_city_markers", { credentials: "include" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        // 'data' contient déjà {name, count, co2, coords} grâce à ton backend
        setCityMarkers(data.filter(m => m.coords[0] !== 0 && m.coords[1] !== 0));
      } catch (err) {
        console.error("Error in fetchCityData:", err);
      }
    };
    fetchCityData();
  }, []);

  // --- FONCTION OPEN ACTION POPUP ---
  const openActionPopup = async () => {
    try {
      const res = await fetch("http://localhost:8001/all_actions_names", { credentials: "include" });
      const actionsList = await res.json();
      openFormPopup(
        "Choisir Action",
        [{ name: "action", placeholder: "Sélectionnez l'action", type: "select", options: actionsList }],
        (values, popup) => {
          const selected = values.action;
          if (selected === "reduce_car_use_bicycle" || selected === "reduce_car_use_public_transport") {
            popup.close();
            openFormPopup(
              "Ajouter Action",
              [
                { name: "address_a", placeholder: "Adresse A", type: "text" },
                { name: "address_b", placeholder: "Adresse B", type: "text" },
                { name: "type", placeholder: "Type de voiture", type: "select", options: ["petite", "moyenne", "grande"] }
              ],
              async (values2, popup2) => {
                try {
                  const res2 = await fetch("http://localhost:8001/add_user_actions", {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name: selected, info: values2 })
                  });
                  if (!res2.ok) throw new Error("Erreur ajout action");
                  popup2.close();
                  fetchActions();
                  window.location.reload();
                } catch {
                  alert("Erreur réseau ou non authentifié");
                }
              }
            );
          } else {
            alert("Action non développée");
          }
        }
      );
    } catch (err) {
      console.error(err);
      alert("Impossible de charger la liste des actions");
    }
  };

  // --- FONCTION OPEN PROFILE POPUP ---
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
        const res = await fetch("http://localhost:8001/initialise_user_profiles", {
          method: "POST",
          credentials: 'include',
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values)
        });
        if (!res.ok) throw new Error("Erreur update profil");
        popup.close();
        setProfile(values);
        window.location.reload();
      } catch {
        alert("Erreur réseau ou non authentifié");
      }
    },
    profile
  );

  const handleLogout = () => fetch("http://localhost:8001/logout", { method: "GET", credentials: "include" })
    .then(() => window.location.reload()).catch(console.error);

  const handleOnboarding = () => setShowOnboarding(true);

  // --- INITIALISATION DE LA CARTE ---
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    mapInstanceRef.current = L.map(mapContainerRef.current, {
      center: [44.837789, -0.57918],
      zoom: 12,
      scrollWheelZoom: false
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapInstanceRef.current);

    layerGroupRef.current.addTo(mapInstanceRef.current);

    const invalidate = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    };
    setTimeout(invalidate, 100);
    setTimeout(invalidate, 500);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // --- MISE À JOUR DES FORMES ---
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const lg = layerGroupRef.current;
    lg.clearLayers();

    if (Array.isArray(cityMarkers) && cityMarkers.length > 0) {
      cityMarkers.forEach(({ name, count, co2, coords }) => {
        if (!coords || coords[0] === 0) return;
        L.circle(coords, {
          color: "olive",
          fillColor: "olive",
          fillOpacity: 0.3,
          radius: 1000
        }).bindPopup(`<b>Ville: ${name}</b><br>Nombre d'utilisateurs: ${count}<br>CO2: ${co2?.toFixed?.(4) ?? "?"}`)
        .addTo(lg);
      });
    }

    if (coordinates?.length === 2 && coordinates[0] !== 0) {
      const lat = coordinates[0];
      const lon = coordinates[1];
      const size = 0.002;
      const points = [[lat + size, lon], [lat - size, lon - size], [lat - size, lon + size]];
      L.polygon(points, {
        color: "green",
        fillColor: "green",
        fillOpacity: 0.8,
        weight: 3
      }).bindPopup(`<b>Impact Personnel</b><br>Total: ${tco2e?.tco2e_total?.toFixed?.(4) ?? "?"} tCO2`)
      .addTo(lg);
    }

    if (lg.getLayers().length > 0) {
      try {
        mapInstanceRef.current.fitBounds(lg.getBounds().pad(0.1));
      } catch (e) {}
    }
  }, [cityMarkers, coordinates, tco2e]);

  return (
    <div className="min-h-screen bg-cover bg-center bg-fixed" style={{ backgroundImage: "url('https://thumbs.dreamstime.com/b/misty-forest-scene-serene-green-nature-background-ideal-relaxation-documentaries-tones-soft-light-atmosphere-themes-376070078.jpg')" }}>
      <div className="absolute inset-0 bg-black/40"></div>
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header onAddAction={openActionPopup} onUpdateProfile={openProfilePopup} onLogout={handleLogout} onOnboarding={handleOnboarding} />
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
                          {badges.current_badge && badges.current_badge.image && (
                            <img src={`http://localhost:8001${badges.current_badge.image}`} alt="current" style={{ width: "2.5cm", height: "2.5cm", objectFit: "contain" }} />
                          )}
                        </td>
                        <td style={{ verticalAlign: "top" }}>
                          <div className="font-semibold mb-2 text-xs uppercase text-gray-400">Prochain badge</div>
                          {badges.next_badge && badges.next_badge.image && (
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