export function openFormPopup(title, fields, onSubmit, initialValues={}) {
  const width=450, height=600; // Un peu plus large pour le texte
  const left=window.innerWidth/2-width/2, top=window.innerHeight/2-height/2;
  const newWindow = window.open("", title, `width=${width},height=${height},top=${top},left=${left}`);
  if(!newWindow){ alert("Autorise les pop-ups !"); return; }

  newWindow.document.write(`
    <style>
      body { font-family: -apple-system, sans-serif; padding: 20px; background: #f9fafb; color: #374151; }
      h3 { margin-bottom: 20px; text-align: center; color: olive; font-size: 1.5rem; }
      form { display:flex; flex-direction: column; gap:15px; }
      .field-group { display: flex; flex-direction: column; gap: 5px; }
      label { font-size: 13px; font-weight: 600; color: #4b5563; }
      input, select { padding:10px; border:1px solid #d1d5db; border-radius:6px; font-size:14px; width: 100%; box-sizing: border-box; }
      input:focus, select:focus { outline: 2px solid olive; border-color: transparent; }
      .buttons { display:flex; justify-content:flex-end; gap:10px; margin-top:25px; }
      button { padding:10px 20px; border:none; border-radius:6px; cursor:pointer; font-weight:bold; }
      #cancelBtn { background:#e5e7eb; color:#374151; } 
      button[type="submit"]{ background:olive; color:white; } 
    </style>
    <h3>${title}</h3>
    <form id="popupForm"></form>
    <div class="buttons">
      <button type="button" id="cancelBtn">Annuler</button>
      <button type="submit" form="popupForm">Confirmer</button>
    </div>
  `);

  const form = newWindow.document.getElementById("popupForm");

  fields.forEach(f => {
    // On crée un conteneur pour chaque champ avec son label
    const group = document.createElement("div");
    group.className = "field-group";

    // On utilise le placeholder comme Label au-dessus du champ
    const label = document.createElement("label");
    label.innerText = f.placeholder || f.name;
    group.appendChild(label);

    if(f.type==="select"){
      const select = document.createElement("select");
      select.name = f.name;
      // Option vide par défaut pour forcer le choix
      const def = document.createElement("option");
      def.innerText = "-- Choisir --";
      def.value = "";
      select.appendChild(def);

      f.options.forEach(opt => {
        const option = document.createElement("option");
        option.value=opt;
        option.innerText=opt;
        if(initialValues[f.name] === opt) option.selected = true;
        select.appendChild(option);
      });
      group.appendChild(select);
    } else {
      const input = document.createElement("input");
      input.name=f.name;
      input.type=f.type||"text";
      input.value=initialValues[f.name]||"";
      if(f.disabled) input.disabled = true;
      group.appendChild(input);
    }
    form.appendChild(group);
  });

  form.addEventListener("submit", e => {
    e.preventDefault();
    const values={};
    fields.forEach(f => values[f.name] = form[f.name].value);
    onSubmit(values, newWindow);
  });

  newWindow.document.getElementById("cancelBtn").addEventListener("click", () => newWindow.close());
}
