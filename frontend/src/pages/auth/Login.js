import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]  = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return toast.error('Email is required');
    if (!password)     return toast.error('Password is required');
    setLoading(true);
    try {
      await login(email.trim(), password);
      toast.success('Welcome back! 👋');
      navigate('/', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', background:'linear-gradient(160deg,#1a4fd6 0%,#0e2a8a 100%)' }}>
      <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', color:'white', padding:'40px 24px 32px' }}>
        <div style={{ fontSize:56, marginBottom:10 }}>💳</div>
        <h1 style={{ fontSize:32, fontWeight:800, margin:0 }}>CreditBook</h1>
        <p style={{ opacity:.7, marginTop:8, fontSize:14 }}>Your Credit, Your Control</p>
      </div>
      <div style={{ background:'white', borderRadius:'24px 24px 0 0', padding:'32px 24px 48px' }}>
        <h2 style={{ fontSize:22, fontWeight:800, marginBottom:4 }}>Welcome back 👋</h2>
        <p style={{ fontSize:13, color:'var(--text3)', marginBottom:28 }}>Login to manage your business</p>
        <form onSubmit={submit}>
          <div className="field">
            <label>Email Address</label>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <span>✉️</span>
              <input type="email" placeholder="Enter your email" value={email} onChange={e=>setEmail(e.target.value)} autoFocus style={{ flex:1, fontSize:15, background:'transparent', border:'none', outline:'none' }} />
            </div>
          </div>
          <div className="field">
            <label>Password</label>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <span>🔒</span>
              <input type={showPass?'text':'password'} placeholder="Enter your password" value={password} onChange={e=>setPassword(e.target.value)} style={{ flex:1, fontSize:15, background:'transparent', border:'none', outline:'none' }} />
              <button type="button" onClick={()=>setShowPass(s=>!s)} style={{ fontSize:16, color:'var(--text3)' }}>{showPass?'🙈':'👁️'}</button>
            </div>
          </div>
          <button type="submit" disabled={loading} style={{ width:'100%', padding:15, borderRadius:50, background:loading?'var(--border)':'linear-gradient(135deg,#1a4fd6,#0e2a8a)', color:'white', fontSize:15, fontWeight:700, border:'none', cursor:loading?'not-allowed':'pointer', marginTop:8, boxShadow:loading?'none':'0 4px 20px rgba(26,79,214,.35)', fontFamily:'inherit' }}>
            {loading ? 'Logging in…' : '🔓 Login'}
          </button>
        </form>
        <p style={{ textAlign:'center', marginTop:24, fontSize:14, color:'var(--text3)' }}>
          Don't have an account? <Link to="/register" style={{ color:'var(--blue)', fontWeight:700 }}>Create account</Link>
        </p>
      </div>
    </div>
  );
}
