// pages/OnboardingPage.jsx
import React from "react";

// Tes badges (inchangés)
const path = "http://localhost:8001/static/image/";
const badges = [
  { name: "Graine d'Éveil", image: path + "00.png" },
  { name: "Pousse Durable", image: path + "10.png" },
  { name: "Jeune Arbuste", image: path + "20.png" },
  { name: "Chêne Vigoureux", image: path + "01.png" },
  { name: "Forêt Gardienne", image: path + "11.png" },
  { name: "Légende d'Émeraude", image: path + "21.png" },
];

export default function OnboardingPage({ onClose }) {
  return (
    // L'overlay qui couvre toute la page (fond semi-transparent) → INCHANGÉ
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      {/* La fenêtre popup elle-même → INCHANGÉ */}
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "12px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
          width: "90%",
          maxWidth: "600px",
          maxHeight: "85vh",
          overflowY: "auto",
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Bouton fermer → INCHANGÉ */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "12px",
            right: "16px",
            fontSize: "28px",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#666",
          }}
        >
          ×
        </button>

        {/* Contenu onboarding – SEUL LE TEXTE A ÉTÉ ENRICHI */}
        <div style={{ padding: "32px" }}>
          <h1 style={{ textAlign: "center", color: "olive", marginBottom: "24px" }}>
            Bienvenue sur Jade Vine AI (Beta)
          </h1>

          <section style={{ marginBottom: "24px" }}>
            <h2 style={{ color: "olive" }}>Pourquoi agir ?</h2>
            <p>
              Chaque petit geste compte : réduire ses émissions de CO₂, trier ses déchets, manger plus local et végétal, ou se déplacer autrement, ce n’est pas seulement bon pour la planète, c’est aussi bon pour notre santé, notre pouvoir d’achat et notre avenir commun.
            </p>
            <p style={{ marginTop: "12px" }}>
              Aujourd’hui, nous faisons face à un défi majeur : le changement climatique touche déjà tout le monde, mais ce sont les plus vulnérables qui en souffrent le plus. Agir individuellement permet de créer un effet boule de neige : quand des milliers de citoyens s’engagent, les villes, les entreprises et les décideurs suivent.
            </p>
            <p style={{ fontStyle: "italic", marginTop: "16px", color: "#444" }}>
              « L'environnementalisme sans lutte des classes, c'est du jardinage ! »
              — Chico Mendes
              (défenseur de la forêt amazonienne, assassiné en 1988 pour avoir protégé la nature et les communautés locales)
            </p>
            <p style={{ marginTop: "8px", fontSize: "0.9em", color: "#555" }}>
              Cette phrase nous rappelle que protéger l’environnement doit aller de pair avec plus de justice sociale et de solidarité.
            </p>
          </section>

          <section style={{ marginBottom: "24px" }}>
            <h2 style={{ color: "olive" }}>Notre Vision</h2>
            <p>
              Jade Vine AI est une plateforme qui récompense concrètement vos actions écologiques au quotidien. Au lieu de culpabiliser, on préfère motiver : vous gagnez de l’argent réel (basé sur le CO₂ évité), des badges de progression, et vous contribuez au classement de votre ville.
            </p>
            <ul style={{ marginTop: "12px", paddingLeft: "20px", lineHeight: "1.6" }}>
              <li>💰 Recevez de l’argent pour chaque tonne de CO₂ évitée grâce à vos gestes</li>
              <li>🏅 Collectionnez des badges qui montrent votre engagement croissant</li>
              <li>🏙️ Participez à la compétition nationale entre villes : plus votre ville agit, plus elle gagne des projets concrets (pistes cyclables, arbres, etc.)</li>
              <li>🗺️ Visualisez en temps réel l’impact collectif sur une carte interactive</li>
            </ul>
          </section>

          <section style={{ marginBottom: "24px" }}>
            <h2 style={{ color: "olive", textAlign: "center" }}>Badges</h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", justifyContent: "center" }}>
              {badges.map((badge, index) => (
                <div key={index} style={{ textAlign: "center" }}>
                  <img
                    src={badge.image}
                    alt={badge.name}
                    style={{ width: "60px", height: "60px", objectFit: "contain" }}
                  />
                  <p style={{ fontSize: "12px", marginTop: "4px" }}>{badge.name}</p>
                </div>
              ))}
            </div>
            <p style={{ textAlign: "center", marginTop: "16px", fontSize: "0.9em", color: "#555" }}>
              Vous commencez à "Graine d'Éveil". Chaque action validée vous fait progresser vers les niveaux supérieurs.
            </p>
          </section>

          <section style={{ marginBottom: "32px" }}>
            <h2 style={{ color: "olive" }}>Comment ça marche ?</h2>
            <p>
              1. Complétez votre profil (nom, âge, ville, etc.) pour que vos actions soient bien comptabilisées.<br />
              2. Déclarez vos gestes éco-responsables dans les catégories mobilité, alimentation, énergie, déchets, etc.<br />
              3. Validez-les (preuves simples ou auto-déclaration selon l’action).<br />
              4. Suivez votre impact en € gagnés, CO₂ évité et progression de badge sur votre tableau de bord.
            </p>
          </section>

          {/* Bouton J'ai compris → INCHANGÉ */}
          <div style={{ textAlign: "center", marginTop: "32px" }}>
            <button
              onClick={onClose}
              style={{
                backgroundColor: "olive",
                color: "white",
                padding: "12px 32px",
                border: "none",
                borderRadius: "8px",
                fontSize: "16px",
                cursor: "pointer",
              }}
            >
              J'ai compris
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}