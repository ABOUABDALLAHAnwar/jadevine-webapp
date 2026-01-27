import { useEffect, useState } from 'react';

export function useActions() {
  const [actions, setActions] = useState([]);

  const fetchActions = async () => {
    try {
      const res = await fetch('https://jadevinebackend-production.up.railway.app/all_actions_templates', { credentials: 'include' });
      if (!res.ok) { setActions([]); return; }
      const data = await res.json();
      setActions(Array.isArray(data) ? data : []);
    } catch { setActions([]); }
  };

  useEffect(() => { fetchActions(); }, []);

  return { actions, fetchActions };
}
