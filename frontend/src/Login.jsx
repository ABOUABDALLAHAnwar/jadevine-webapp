import { useState, useEffect } from 'react';

export default function AuthPage({ onLogin }) {
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupPasswordConfirm, setSignupPasswordConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false); // toggle œil
  const [message, setMessage] = useState('');
  const [checkedAuth, setCheckedAuth] = useState(false);

  // Vérification du token au démarrage
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('http://localhost:8001/me', {
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          onLogin(data); // utilisateur connecté
        } else {
          setCheckedAuth(true);
        }
      } catch (err) {
        setMessage('« Quand les citoyens prennent leurs responsabilités écologiques, la société doit savoir les récompenser. » Dr Anwar ABOUABDALLAH, CEO');
        setCheckedAuth(true);
      }
    };
    checkAuth();
  }, [onLogin]);

  if (!checkedAuth && !message) {
    return null; // loader optionnel
  }

  // --------------------- LOGIN ---------------------
  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage('');

    const formData = new URLSearchParams();
    formData.append('username', loginEmail);
    formData.append('password', loginPassword);

    try {
      const res = await fetch('http://localhost:8001/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData,
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok) {
        onLogin(data);
      } else {
        setMessage(data.detail || 'Identifiants incorrects');
      }
    } catch (err) {
      setMessage('« Quand les citoyens prennent leurs responsabilités écologiques, la société doit savoir les récompenser. » Dr Anwar ABOUABDALLAH, CEO');
    }
  };

  // --------------------- SIGNUP ---------------------
  const handleSignup = async (e) => {
    e.preventDefault();
    setMessage('');

    if (signupPassword !== signupPasswordConfirm) {
      setMessage('Les mots de passe ne correspondent pas');
      return;
    }
    if (signupPassword.length < 8) {
      setMessage('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    const formData = new URLSearchParams();
    formData.append('email', signupEmail);
    formData.append('password', signupPassword);

    try {
      const res = await fetch('http://localhost:8001/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData,
      });
      const data = await res.json();

      if (res.ok) {
        setMessage('Compte créé avec succès ! Connectez-vous.');
        setSignupEmail('');
        setSignupPassword('');
        setSignupPasswordConfirm('');
      } else {
        setMessage(data.detail || 'Erreur lors de l’inscription');
      }
    } catch (err) {
      setMessage('« Quand les citoyens prennent leurs responsabilités écologiques, la société doit savoir les récompenser. » Dr Anwar ABOUABDALLAH, CEO');
    }
  };

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: Arial, sans-serif; }
        .auth-bg {
          min-height: 100vh;
          background: linear-gradient(rgba(0,0,0,0.35), rgba(0,0,0,0.35)),
            url('https://thumbs.dreamstime.com/b/misty-forest-scene-serene-green-nature-background-ideal-relaxation-documentaries-tones-soft-light-atmosphere-themes-376070078.jpg')
            center/cover no-repeat fixed;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .auth-wrapper { display: flex; gap: 40px; }
        .card {
          width: 340px;
          padding: 40px 30px;
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.95);
          box-shadow: 0 15px 35px rgba(0,0,0,0.3);
        }
        .card.signup { background: rgba(200, 240, 190, 0.95); }
        .card h2 { text-align: center; margin-bottom: 30px; font-size: 28px; }
        .card input {
          width: 100%;
          padding: 14px;
          margin-bottom: 16px;
          border-radius: 10px;
          border: 1px solid #aaa;
        }
        .card button {
          width: 100%;
          padding: 14px;
          background: #4a6c59;
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 18px;
          font-weight: bold;
          cursor: pointer;
        }
        .password-wrapper { position: relative; }
        .password-toggle {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          cursor: pointer;
          user-select: none;
        }
        .message {
          position: fixed;
          bottom: 30px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0,0,0,0.7);
          color: white;
          padding: 15px 30px;
          border-radius: 10px;
        }
      `}</style>

      <div className="auth-bg">
        <div className="auth-wrapper">
          {/* LOGIN */}
          <div className="card">
            <h2>Connexion</h2>
            <form onSubmit={handleLogin}>
              <input
                type="text"
                placeholder="Email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Mot de passe"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
              />
              <button type="submit">Login</button>
            </form>
          </div>

          {/* SIGNUP */}
          <div className="card signup">
            <h2>Inscription</h2>
            <form onSubmit={handleSignup}>
              <input
                type="email"
                placeholder="Email"
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                required
              />

              <div className="password-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mot de passe"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  required
                />
                <span
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? '🙈' : '👁️'}
                </span>
              </div>

              <div className="password-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Confirmer le mot de passe"
                  value={signupPasswordConfirm}
                  onChange={(e) => setSignupPasswordConfirm(e.target.value)}
                  required
                />
                <span
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? '🙈' : '👁️'}
                </span>
              </div>

              <button type="submit">Sign Up</button>
            </form>
          </div>
        </div>

        {message && <div className="message">{message}</div>}
      </div>
    </>
  );
}
