import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function Register() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name:'', email:'', phone:'', password:'', confirmPassword:'', businessName:'', businessType:'' });
  const [showPass, setShowPass]       = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading]         = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const validateStep1 = () => {
    if (!form.name.trim())  { toast.error('Full name is required'); return false; }
    if (!form.email.trim()) { toast.error('Email is required'); return false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { toast.error('Enter a valid email'); return false; }
    if (!form.phone.trim() || form.phone.replace(/\D/g,'').length < 10) { toast.error('Enter a valid phone number'); return false; }
    if (!form.password || form.password.length < 6) { toast.error('Password must be at least 6 characters'); return false; }
    if (form.password !== form.confirmPassword) { toast.error('Passwords do not match'); return false; }
    return true;
  };

  const handleNext = (e) => { e.preventDefault(); if (validateStep1()) setStep(2); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register({ ...form, businessName: form.businessName || 'My Business' });
      toast.success('Account created! Welcome 🎉');
      navigate('/', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed.');
    } finally { setLoading(false); }
  };

  const inp = { fontSize:15, background:'transparent', border:'none', outline:'none', width:'100%' };

  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', background:'linear-gradient(160deg,#1a4fd6 0%,#0e2a8a 100%)' }}>
      <div style={{ textAlign:'center', color:'white', padding:'32px 24px 24px' }}>
        <div style={{ fontSize:46, marginBottom:6 }}>💳</div>
        <h1 style={{ fontSize:26, fontWeight:800, margin:0 }}>CreditBook</h1>
      </div>
      <div style={{ flex:1, background:'white', borderRadius:'24px 24px 0 0', padding:'28px 24px 40px', overflowY:'auto' }}>
        <div style={{ display:'flex', gap:8, marginBottom:24 }}>
          {[1,2].map(s=><div key={s} style={{ flex:1, height:4, borderRadius:4, background:step>=s?'#1a4fd6':'#e0e6f8', transition:'background .3s' }}/>)}
        </div>
        <h2 style={{ fontSize:21, fontWeight:800, marginBottom:4 }}>{step===1?'Create Account':'Business Details'}</h2>
        <p style={{ fontSize:13, color:'var(--text3)', marginBottom:24 }}>{step===1?'Step 1 of 2 — Personal information':'Step 2 of 2 — Business info (optional)'}</p>

        {step===1 && (
          <form onSubmit={handleNext}>
            <div className="field"><label>Full Name *</label><input placeholder="Your full name" value={form.name} onChange={set('name')} autoFocus style={inp} /></div>
            <div className="field"><label>Email Address *</label><input type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} style={inp} /></div>
            <div className="field">
              <label>Phone Number *</label>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ fontSize:13, fontWeight:700, color:'var(--text2)', flexShrink:0 }}>+91</span>
                <input type="tel" placeholder="10-digit number" value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value.replace(/\D/g,'').slice(0,10)}))} style={inp} maxLength={10} />
              </div>
            </div>
            <div className="field">
              <label>Password *</label>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <input type={showPass?'text':'password'} placeholder="Min. 6 characters" value={form.password} onChange={set('password')} style={{ ...inp, flex:1 }} />
                <button type="button" onClick={()=>setShowPass(s=>!s)} style={{ fontSize:16, color:'var(--text3)' }}>{showPass?'🙈':'👁️'}</button>
              </div>
            </div>
            <div className="field">
              <label>Confirm Password *</label>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <input type={showConfirm?'text':'password'} placeholder="Re-enter password" value={form.confirmPassword} onChange={set('confirmPassword')} style={{ ...inp, flex:1 }} />
                <button type="button" onClick={()=>setShowConfirm(s=>!s)} style={{ fontSize:16, color:'var(--text3)' }}>{showConfirm?'🙈':'👁️'}</button>
              </div>
              {form.confirmPassword && form.password!==form.confirmPassword && <p style={{ fontSize:11, color:'var(--red)', marginTop:4 }}>⚠️ Passwords do not match</p>}
              {form.confirmPassword && form.password===form.confirmPassword && form.password.length>=6 && <p style={{ fontSize:11, color:'var(--green)', marginTop:4 }}>✅ Passwords match</p>}
            </div>
            <button type="submit" className="btn btn-primary btn-full" style={{ padding:15, marginTop:8 }}>Continue →</button>
            <p style={{ textAlign:'center', marginTop:20, fontSize:14, color:'var(--text3)' }}>Already have account? <Link to="/login" style={{ color:'var(--blue)', fontWeight:700 }}>Login</Link></p>
          </form>
        )}

        {step===2 && (
          <form onSubmit={handleSubmit}>
            <div className="field"><label>Business Name</label><input placeholder="e.g. Sharma Store" value={form.businessName} onChange={set('businessName')} autoFocus style={inp} /></div>
            <div className="field">
              <label>Business Type</label>
              <select value={form.businessType} onChange={set('businessType')} style={inp}>
                <option value="">Select (optional)</option>
                <option value="retail">🛒 Retail Shop</option>
                <option value="wholesale">📦 Wholesale</option>
                <option value="restaurant">🍽️ Restaurant</option>
                <option value="services">🔧 Services</option>
                <option value="grocery">🥬 Grocery</option>
                <option value="pharmacy">💊 Pharmacy</option>
                <option value="other">📋 Other</option>
              </select>
            </div>
            <div style={{ background:'var(--blue-lt)', borderRadius:12, padding:'12px 14px', marginBottom:16 }}>
              <p style={{ fontSize:12, fontWeight:700, color:'var(--blue)', marginBottom:8 }}>✅ Account details</p>
              <p style={{ fontSize:13, color:'var(--text2)', marginBottom:3 }}>👤 {form.name}</p>
              <p style={{ fontSize:13, color:'var(--text2)', marginBottom:3 }}>✉️ {form.email}</p>
              <p style={{ fontSize:13, color:'var(--text2)' }}>📱 +91 {form.phone}</p>
            </div>
            <button type="submit" className="btn btn-primary btn-full" style={{ padding:15 }} disabled={loading}>{loading?'Creating…':'🚀 Create Account'}</button>
            <button type="button" onClick={()=>setStep(1)} className="btn btn-ghost btn-full" style={{ padding:13, marginTop:10 }}>← Back</button>
          </form>
        )}
      </div>
    </div>
  );
}
