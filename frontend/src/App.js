import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./Dashboard3";
import Login from "./Login";
import OnboardingPage from "./pages/OnboardingPage"; // Ton composant onboarding

function App() {
  const [user, setUser] = useState(null);

  return (
    <Router>
      <Routes>
        {!user ? (
          <Route path="*" element={<Login onLogin={data => setUser(data)} />} />
        ) : (
          <>
            <Route path="/" element={<Dashboard />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
          </>
        )}
      </Routes>
    </Router>
  );
}

export default App;
