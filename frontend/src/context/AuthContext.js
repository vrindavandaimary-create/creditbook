import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Hardcoded Render backend URL — no /api at the end
axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'https://creditbook-eqjh.onrender.com';

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('cb_tok') || null);
  const [user,  setUser]  = useState(() => {
    try { return JSON.parse(localStorage.getItem('cb_usr') || 'null'); }
    catch { return null; }
  });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (token) axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    else delete axios.defaults.headers.common['Authorization'];
    setReady(true);
  }, [token]);

  const persist = (tok, usr) => {
    setToken(tok); setUser(usr);
    localStorage.setItem('cb_tok', tok);
    localStorage.setItem('cb_usr', JSON.stringify(usr));
    axios.defaults.headers.common['Authorization'] = `Bearer ${tok}`;
  };

  const login = async (email, password) => {
    const r = await axios.post('/api/auth/login', { email, password });
    persist(r.data.token, r.data.user);
    return r.data;
  };

  const register = async (data) => {
    const r = await axios.post('/api/auth/register', data);
    persist(r.data.token, r.data.user);
    return r.data;
  };

  const logout = () => {
    setToken(null); setUser(null);
    localStorage.removeItem('cb_tok');
    localStorage.removeItem('cb_usr');
    delete axios.defaults.headers.common['Authorization'];
  };

  const updateUser = (u) => {
    setUser(u);
    localStorage.setItem('cb_usr', JSON.stringify(u));
  };

  return (
    <Ctx.Provider value={{ token, user, ready, login, register, logout, updateUser }}>
      {ready ? children : null}
    </Ctx.Provider>
  );
}
