import { openFormPopup } from "../utils/openFormPopup";
import { ACTION_DISPLAY_NAMES, FOOD_OPTIONS, BACKEND_URL } from "./ActionConfigs";

export const handleOpenActionPopup = async (fetchActions, refreshUserData, celebrate) => {
  try {
    const res = await fetch(`${BACKEND_URL}/all_actions_names`, { credentials: "include" });
    const actionsList = await res.json();
    const displayOptions = actionsList.map(key => `${ACTION_DISPLAY_NAMES[key] || key} | ${key}`);

    openFormPopup("Choisir Action", [{ name: "action", placeholder: "Sélectionnez l'action", type: "select", options: displayOptions }], (values, popup) => {
      const selectedRaw = values.action;
      const selected = selectedRaw.includes(" | ") ? selectedRaw.split(" | ")[1].trim() : selectedRaw;
      popup.close();

      // Fonction interne pour gérer l'envoi et le refresh
      const submitAction = async (info, p) => {
        const res2 = await fetch(`${BACKEND_URL}/add_user_actions`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: selected, info })
        });
        if (res2.ok) {
          p.close();
          celebrate();
          fetchActions();
          refreshUserData();
        }
      };

      // --- BRANCHES LOGIQUES ---
      if (selected === "reduce_car_use_bicycle" || selected === "reduce_car_use_public_transport") {
        openFormPopup("Détails Trajet", [
          { name: "address_a", placeholder: "Adresse de départ (A)", type: "address" },
          { name: "address_b", placeholder: "Adresse d'arrivée (B)", type: "address" },
          { name: "type", placeholder: "Type de voiture remplacée", type: "select", options: ["petite", "moyenne", "grande"] }
        ], (v2, p2) => submitAction(v2, p2));
      }
      else if (selected === "plant_based_diet") {
        openFormPopup("Combien de repas ?", [{ name: "nb", placeholder: "Nombre de repas (1-5)", type: "number" }], (v2, p2) => {
          const nb = Math.min(Math.max(parseInt(v2.nb) || 1, 1), 5);
          p2.close();
          const mealFields = [];
          for (let i = 0; i < nb; i++) {
            mealFields.push({ name: `r_${i}`, placeholder: `REPAS ${i+1} : Aliment ÉVITÉ`, type: "select", options: FOOD_OPTIONS });
            mealFields.push({ name: `c_${i}`, placeholder: `REPAS ${i+1} : Aliment CONSOMMÉ`, type: "select", options: FOOD_OPTIONS });
          }
          openFormPopup("Détails des repas", mealFields, (v3, p3) => {
            const replaced = []; const consumed = [];
            for (let i = 0; i < nb; i++) { replaced.push(v3[`r_${i}`]); consumed.push(v3[`c_${i}`]); }
            submitAction({ meals_replaced: replaced, meals_consumed: consumed }, p3);
          });
        });
      }
      else if (selected === "waste_reduction") {
        openFormPopup("Bilan Déchets", [
          { name: "bulk_done", placeholder: "Vrac ?", type: "select", options: ["Oui", "Non"] },
          { name: "is_family", placeholder: "Foyer ?", type: "select", options: ["Oui", "Non"] },
          { name: "compost_buckets", placeholder: "Seaux compost", type: "number" },
          { name: "recycling_done", placeholder: "Tri ?", type: "select", options: ["Oui", "Non"] },
          { name: "recycling_bin_size", placeholder: "Taille bac", type: "select", options: ["small", "large"] },
          { name: "glass_trips", placeholder: "Trajets verre", type: "number" }
        ], (v2, p2) => {
          const info = {
            ...v2,
            bulk_done: v2.bulk_done === "Oui",
            is_family: v2.is_family === "Oui",
            recycling_done: v2.recycling_done === "Oui",
            compost_buckets: parseInt(v2.compost_buckets) || 0,
            glass_trips: parseInt(v2.glass_trips) || 0
          };
          submitAction(info, p2);
        });
      }
      else if (selected === "tree_planting") {
        openFormPopup("Planter", [{ name: "nb", placeholder: "Nb arbres", type: "number" }], (v2, p2) => submitAction(parseInt(v2.nb) || 0, p2));
      }
      else if (selected === "renewable_energy") {
        openFormPopup("Énergie", [{ name: "type", placeholder: "Logement", type: "select", options: ["apartment", "house"] }], (v2, p2) => submitAction(v2.type, p2));
      }
    });
  } catch (err) {
    console.error("Erreur dans handleOpenActionPopup:", err);
  }
};