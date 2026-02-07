import React from 'react';
import JadevineLogo from '../JadevineAI.png';

function Header({ onAddAction, onUpdateProfile, onLogout, onOnboarding, onOpenDocuments }) {
  // Style "Onglet" : arrondi uniquement en haut (rounded-t-lg), plat en bas
  const btnStyle = "px-5 py-2 rounded-t-lg transition-all duration-200 active:scale-95 shadow-md hover:shadow-lg font-medium flex items-center justify-center gap-2 border-x border-t";

  return (
    <header className="flex justify-between items-end px-6 pt-4 h-28 bg-gray-900/80 backdrop-blur-sm text-white rounded-b-xl shadow-lg border-b border-white/20">

      {/* Gauche : Logo + Titre (légèrement décollés du bord avec pb-1) */}
      <div className="flex items-end gap-4 pb-2">
        <div className="w-12 h-12 flex items-center justify-center flex-shrink-0">
          <img
            src={JadevineLogo}
            alt="Jadevine Logo"
            className="max-h-full max-w-full object-contain"
            style={{
              maxHeight: '48px',
              maxWidth: '150px',
              height: 'auto',
              width: 'auto',
            }}
          />
        </div>

        <h1 className="text-2xl font-bold whitespace-nowrap bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
          Bienvenue sur Jade Vine AI <span className="text-xs font-light opacity-50 uppercase tracking-tighter">Beta</span>
        </h1>
      </div>

      {/* Droite : Boutons collés au bas de la bordure */}
      <div className="flex gap-1 items-end">
        {/* Nouveau bouton Documents */}

        <button
          onClick={onAddAction}
          className={`${btnStyle} bg-gradient-to-br from-blue-500 to-blue-700 hover:from-blue-400 hover:to-blue-600 border-blue-400/30`}
        >
          <span>🌱</span> Enregistrer un geste
        </button>

        <button
          onClick={onUpdateProfile}
          className={`${btnStyle} bg-gradient-to-br from-green-500 to-green-700 hover:from-green-400 hover:to-green-600 border-green-400/30`}
        >
          <span>👤</span> Mes infos
        </button>
        <button
          onClick={onOpenDocuments}
          className={`${btnStyle} bg-gradient-to-br from-amber-500 to-amber-700 hover:from-amber-400 hover:to-amber-600 border-amber-400/30`}
        >
          <span>📂</span> Documents
        </button>

        <button
          onClick={onOnboarding}
          className={`${btnStyle} bg-gradient-to-br from-purple-500 to-purple-700 hover:from-purple-400 hover:to-purple-600 border-purple-500/30`}
        >
          <span>💡</span> Premiers pas
        </button>

        <button
          onClick={onLogout}
          className={`${btnStyle} bg-gradient-to-br from-red-500 to-red-700 hover:from-red-400 hover:to-red-600 border-red-400/30`}
        >
          <span>👋</span> Quitter
        </button>
      </div>
    </header>
  );
}

export default Header;