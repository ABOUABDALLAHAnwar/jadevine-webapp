import React from 'react';
import ContributionDonut from "../components/ContributionDonut";
import { BACKEND_URL } from "./ActionConfigs";

export default function ProfileSection({ profile, badges, tco2e, contributions }) {
  return (
    <div className="card bg-white/90 backdrop-blur-sm shadow-xl p-6 flex flex-col justify-between h-full overflow-y-auto">
      <div>
        <h2 className="text-4xl font-extrabold mb-6" style={{ color: 'olive' }}>Profil Utilisateur</h2>
        <div className="space-y-1">
          <p><strong>Nom:</strong> {profile.name}</p>
          <p><strong>Poste:</strong> {profile.position}</p>
          <p><strong>À propos:</strong> {profile.about}</p>
          <p><strong>Âge:</strong> {profile.age}</p>
          <p><strong>Pays:</strong> {profile.country}</p>
          <p><strong>Adresse:</strong> {profile.address}</p>
          <p><strong>Téléphone:</strong> {profile.phone}</p>
        </div>

        <div className="my-8">
          <table style={{ margin: "0 auto", borderCollapse: "separate", borderSpacing: "60px 0" }}>
            <tbody>
              <tr style={{ textAlign: "center" }}>
                <td>
                  <div className="font-semibold mb-2 text-xs uppercase text-gray-400">Badge actuel</div>
                  {badges.current_badge?.image && (
                    <img src={`${BACKEND_URL}${badges.current_badge.image}`} alt="current" style={{ width: "2.5cm", height: "2.5cm", objectFit: "contain" }} />
                  )}
                </td>
                <td>
                  <div className="font-semibold mb-2 text-xs uppercase text-gray-400">Prochain badge</div>
                  {badges.next_badge?.image && (
                    <img src={`${BACKEND_URL}${badges.next_badge.image}`} alt="next" style={{ width: "2.5cm", height: "2.5cm", objectFit: "contain", opacity: 0.4 }} />
                  )}
                </td>
              </tr>
            </tbody>
          </table>
          <progress className="w-full h-4 mt-6 block" value={badges.progress_percent || 0} max={100} style={{ accentColor: "olive" }} />
          <p className="text-center mt-4 font-bold">{(badges.progress_percent || 0).toFixed(1)} % vers le prochain badge</p>
        </div>

        <h2 className="text-4xl font-extrabold mb-6" style={{ color: 'olive' }}>Bilan d'activité</h2>
        <p className="font-bold text-green-600 mb-2">CO₂ évité: {(tco2e.tco2e_total || 0).toFixed(6)} t</p>
        <div className="flex justify-center items-center my-8">
          <ContributionDonut data={contributions} />
        </div>
      </div>
      <p className="font-bold text-2xl text-center italic border-t border-olive/20 pt-4" style={{ color: 'olive' }}>
        "L'environnementalisme sans lutte des classes, c'est du jardinage !" Chico Mendes
      </p>
    </div>
  );
}