// components/Header.jsx
import React from 'react';
import JadevineLogo from '../JadevineAI.png';  // chemin depuis src/components/

function Header({ onAddAction, onUpdateProfile, onLogout, onOnboarding }) {
  return (
    <header className="flex justify-between items-center p-4 bg-gray-900/80 backdrop-blur-sm text-white rounded-b-lg shadow-lg">

      {/* Logo + Titre : plus grand logo, bien aligné */}
      <div className="flex items-center gap-4">
        {/* Conteneur pour contrôler précisément la taille */}
        <div className="w-12 h-12 flex items-center justify-center flex-shrink-0">
          <img
            src={JadevineLogo}
            alt="Jadevine Logo"
            className="max-h-full max-w-full object-contain"
            style={{
              maxHeight: '48px',   // plus grand que le texte, mais contrôlé
              maxWidth: '150px',
              height: 'auto',
              width: 'auto',
            }}
          />
        </div>

        <h1 className="text-2xl font-bold whitespace-nowrap">
          Bienvenue sur Jade Vine AI (Beta)
        </h1>
      </div>

      {/* Boutons à droite – inchangés */}
      <div className="flex gap-3">
        <button
          onClick={onAddAction}
          className="px-5 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
        >
          Ajouter Action
        </button>
        <button
          onClick={onUpdateProfile}
          className="px-5 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition"
        >
          Update Profile
        </button>
        <button
          onClick={onOnboarding}
          className="px-5 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition"
        >
          Onboarding
        </button>
        <button
          onClick={onLogout}
          className="px-5 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition"
        >
          Logout
        </button>
      </div>
    </header>
  );
}

export default Header;