const openActionPopup = async () => {

    try {
      const res = await fetch(`${BACKEND_URL}/all_actions_names`, { credentials: "include" });
      const actionsList = await res.json();
      const displayOptions = actionsList.map(key => `${ACTION_DISPLAY_NAMES[key] || key} | ${key}`);
      const foodOptions = ["beef", "lamb", "pork", "veal", "chicken", "fish", "cheese", "vegetarian", "vegan"];

      openFormPopup("Choisir Action", [{ name: "action", placeholder: "Sélectionnez l'action", type: "select", options: displayOptions }], (values, popup) => {
          const selectedRaw = values.action;
          const selected = selectedRaw.includes(" | ") ? selectedRaw.split(" | ")[1].trim() : selectedRaw;
          popup.close();

          if (selected === "reduce_car_use_bicycle" || selected === "reduce_car_use_public_transport") {
            openFormPopup("Détails Trajet", [
              { name: "address_a", placeholder: "Adresse de départ (A)", type: "address" },
              { name: "address_b", placeholder: "Adresse d'arrivée (B)", type: "address" },
              { name: "type", placeholder: "Type de voiture remplacée", type: "select", options: ["petite", "moyenne", "grande"] }
            ], async (v2, p2) => {

              const res2 = await fetch(`${BACKEND_URL}/add_user_actions`, {
                method: "POST", credentials: "include", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: selected, info: v2 })
              });
              if (res2.ok) { p2.close(); celebrate(); fetchActions(); refreshUserData(); }
            });
          }
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
                const res2 = await fetch(`${BACKEND_URL}/add_user_actions`, {
                  method: "POST", credentials: "include", headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ name: selected, info: { meals_replaced: replaced, meals_consumed: consumed } })
                });
                if (res2.ok) { p3.close(); celebrate(); fetchActions(); refreshUserData(); }
              });
            });
          }
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

              const res2 = await fetch(`${BACKEND_URL}/add_user_actions`, {
                method: "POST", credentials: "include", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: selected, info: info })
              });
              if (res2.ok) { p2.close(); celebrate(); fetchActions(); refreshUserData(); }
            });
          }
          else if (selected === "tree_planting") {
            openFormPopup("Planter des arbres", [{ name: "nb", placeholder: "Combien d'arbres ?", type: "number" }], async (v2, p2) => {
              const res2 = await fetch(`${BACKEND_URL}/add_user_actions`, {
                method: "POST", credentials: "include", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: selected, info: parseInt(v2.nb) || 0 })
              });
              if (res2.ok) { p2.close(); celebrate(); fetchActions(); refreshUserData(); }
            });
          }
          else if (selected === "renewable_energy") {
            openFormPopup("Énergie Renouvelable", [{ name: "type", placeholder: "Type de logement", type: "select", options: ["apartment", "house"] }], async (v2, p2) => {
              const res2 = await fetch(`${BACKEND_URL}/add_user_actions`, {
                method: "POST", credentials: "include", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: selected, info: v2.type })
              });
              if (res2.ok) { p2.close(); celebrate(); fetchActions(); refreshUserData(); }
            });
          }
      });
    } catch (err) { console.error(err); }
  };