import { useState, useEffect } from "react";

export default function ActionPopup({ actionsList, carTypesList, onClose, onSubmit }) {
  const [selectedAction, setSelectedAction] = useState("");
  const [selectedCarType, setSelectedCarType] = useState("");
  const [distance, setDistance] = useState("");

  const showCarType = selectedAction === "reduce_car_use_public_transport" || selectedAction === "reduce_car_use_bicycle";

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-80">
        <h3 className="text-lg font-bold mb-4">Ajouter Action</h3>
        <div className="flex flex-col gap-3">
          <label>Action :</label>
          <select value={selectedAction} onChange={e => setSelectedAction(e.target.value)}>
            <option value="">-- Choisir une action --</option>
            {actionsList.map(a => <option key={a} value={a}>{a}</option>)}
          </select>

          {showCarType && selectedAction === "reduce_car_use_public_transport" && (
            <>
              <label>Type de voiture :</label>
              <select value={selectedCarType} onChange={e => setSelectedCarType(e.target.value)}>
                <option value="">-- Choisir type --</option>
                {carTypesList.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </>
          )}

          {showCarType && selectedAction === "reduce_car_use_bicycle" && (
            <>
              <label>Type :</label>
              <input type="text" value="bicycle" disabled />
            </>
          )}

          <label>Distance (km) :</label>
          <input type="number" value={distance} onChange={e => setDistance(e.target.value)} />

          <div className="flex justify-end gap-2 mt-4">
            <button className="px-4 py-2 bg-gray-300 rounded" onClick={onClose}>Annuler</button>
            <button
              className="px-4 py-2 bg-green-600 text-white rounded"
              onClick={() => onSubmit({ action: selectedAction, type: selectedCarType || "bicycle", distance })}
            >
              Envoyer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
