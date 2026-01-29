import React, { useState, useEffect } from 'react';

export default function LoadingScreen() {
  const [anecdotes, setAnecdotes] = useState([]);
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    fetch('https://jadevinebackend-production.up.railway.app/annecdotes')
      .then(res => res.json())
      .then(data => setAnecdotes(data))
      .catch(() => setAnecdotes(["La nature prend son temps, Jade Vine aussi..."]));
  }, []);

  useEffect(() => {
    if (anecdotes.length > 0) {
      const timer = setInterval(() => {
        setFade(false);
        setTimeout(() => {
          setIndex((prev) => (prev + 1) % anecdotes.length);
          setFade(true);
        }, 500);
      }, 4000);
      return () => clearInterval(timer);
    }
  }, [anecdotes]);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 99999, backgroundColor: '#050a09',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      color: 'white', textAlign: 'center', overflow: 'hidden'
    }}>
      {/* Halo Vert en arrière-plan */}
      <div style={{
        position: 'absolute', width: '500px', height: '500px',
        background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, rgba(0,0,0,0) 70%)',
        filter: 'blur(60px)', borderRadius: '50%', pointerEvents: 'none'
      }} />

      {/* Sablier Vert */}
      <div style={{ marginBottom: '50px', position: 'relative' }}>
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="1" style={{ filter: 'drop-shadow(0 0 10px rgba(16,185,129,0.4))' }}>
          <path d="M5 22h14M5 2h14" />
          <path d="M17 22c0-3.148-1.146-5.957-3-7.5L9 9.5c-1.854-1.543-3-4.352-3-7.5" />
          <path d="M6 22c0-3.148 1.146-5.957 3-7.5l6-5c1.854-1.543 3-4.352 3-7.5" />
        </svg>
      </div>

      {/* Texte et Anecdotes */}
      <div style={{ maxWidth: '700px', padding: '0 40px', zIndex: 10 }}>
        <h2 style={{ fontSize: '12px', letterSpacing: '0.4em', color: '#10b981', marginBottom: '30px', fontWeight: '900', opacity: 0.8 }}>
          IMMERSION BOTANIQUE
        </h2>

        <div style={{
          minHeight: '120px', transition: 'all 0.5s ease',
          opacity: fade ? 1 : 0, transform: fade ? 'translateY(0)' : 'translateY(-10px)'
        }}>
          <p style={{ fontSize: '24px', fontStyle: 'italic', lineHeight: '1.6', color: '#f3f4f6', fontFamily: 'serif' }}>
            {anecdotes.length > 0 ? `"${anecdotes[index]}"` : "Connexion aux racines..."}
          </p>
        </div>
      </div>

      {/* Barre de progression (les petits traits en bas) */}
      <div style={{ position: 'absolute', bottom: '15%', display: 'flex', gap: '12px' }}>
        {anecdotes.length > 0 && anecdotes.map((_, i) => (
          <div key={i} style={{
            height: '2px', width: i === index ? '40px' : '15px',
            backgroundColor: i === index ? '#10b981' : 'rgba(255,255,255,0.1)',
            transition: 'all 0.8s ease'
          }} />
        ))}
      </div>

      <div style={{ position: 'absolute', bottom: '30px', fontSize: '9px', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.2)' }}>
        GÉNÉRATION DE VOTRE ÉCOSYSTÈME INTELLIGENT
      </div>
    </div>
  );
}