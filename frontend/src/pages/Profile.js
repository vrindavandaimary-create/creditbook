import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { avatarLetter } from '../utils/helpers';

export default function Profile() {
  const { user, logout, updateUser } = useAuth();
  const [editing,  setEditing]  = useState(false);
  const [form,     setForm]     = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    businessName: user?.businessName || '',
    businessType: user?.businessType || ''
  });
  const [pwForm,   setPwForm]   = useState({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
  const [showPw,   setShowPw]   = useState(false);
  const [showPass, setShowPass] = useState({ current: false, new: false, confirm: false });
  const [loading,  setLoading]  = useState(false);
  const [showLogout, setShowLogout] = useState(false);

  const set  = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const setPw = k => e => setPwForm(f => ({ ...f, [k]: e.target.value }));

  const saveProfile = async () => {
    if (!form.name.trim()) return toast.error('Name is required');
    setLoading(true);
    try {
      const r = await axios.put('/api/auth/update', form);
      updateUser(r.data.user);
      toast.success('Profile updated!');
      setEditing(false);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to update'); }
    finally { setLoading(false); }
  };

  const savePassword = async () => {
    if (!pwForm.currentPassword) return toast.error('Enter your current password');
    if (!pwForm.newPassword || pwForm.newPassword.length < 6) return toast.error('New password must be at least 6 characters');
    if (pwForm.newPassword !== pwForm.confirmNewPassword) return toast.error('New passwords do not match');
    setLoading(true);
    try {
      await axios.put('/api/auth/change-password', pwForm);
      toast.success('Password changed!');
      setShowPw(false);
      setPwForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to change password'); }
    finally { setLoading(false); }
  };

  const inputStyle = { width: '100%', fontSize: 15, background: 'transparent', border: 'none', outline: 'none' };

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', paddingBottom: 80 }}>
      {/* Header */}
      <div className="grad-blue" style={{ padding: '30px 16px 36px', color: 'white', textAlign: 'center' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(255,255,255,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: 28, fontWeight: 800 }}>
          {avatarLetter(user?.name || '?')}
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>{user?.name}</h2>
        <p style={{ opacity: .75, marginTop: 4, fontSize: 14 }}>💳 {user?.businessName}</p>
        <p style={{ opacity: .6, fontSize: 12, marginTop: 2 }}>✉️ {user?.email}</p>
        <p style={{ opacity: .6, fontSize: 12, marginTop: 1 }}>📱 {user?.phone}</p>
      </div>

      <div style={{ padding: '16px 14px 0' }}>

        {/* ── Profile Settings ── */}
        <div className="card card-p" style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: editing ? 16 : 0 }}>
            <p style={{ fontWeight: 700, fontSize: 15 }}>👤 Profile Settings</p>
            <button onClick={() => setEditing(s => !s)} style={{ color: 'var(--blue)', fontWeight: 700, fontSize: 13, background: 'var(--blue-lt)', padding: '5px 14px', borderRadius: 50, border: 'none', cursor: 'pointer' }}>
              {editing ? 'Cancel' : 'Edit'}
            </button>
          </div>

          {editing ? (
            <>
              <div className="field"><label>Full Name</label><input placeholder="Your name" value={form.name} onChange={set('name')} autoFocus style={inputStyle} /></div>
              <div className="field"><label>Phone Number</label><input type="tel" placeholder="Phone number" value={form.phone} onChange={set('phone')} style={inputStyle} /></div>
              <div className="field"><label>Business Name</label><input placeholder="Business name" value={form.businessName} onChange={set('businessName')} style={inputStyle} /></div>
              <div className="field">
                <label>Business Type</label>
                <select value={form.businessType} onChange={set('businessType')} style={{ ...inputStyle }}>
                  <option value="">Select type</option>
                  <option value="retail">🛒 Retail Shop</option>
                  <option value="wholesale">📦 Wholesale</option>
                  <option value="restaurant">🍽️ Restaurant / Food</option>
                  <option value="services">🔧 Services</option>
                  <option value="manufacturing">🏭 Manufacturing</option>
                  <option value="grocery">🥬 Grocery Store</option>
                  <option value="pharmacy">💊 Pharmacy / Medical</option>
                  <option value="other">📋 Other</option>
                </select>
              </div>
              <button className="btn btn-primary btn-full" onClick={saveProfile} disabled={loading} style={{ padding: 14 }}>
                {loading ? 'Saving…' : 'Save Changes'}
              </button>
            </>
          ) : (
            <div style={{ marginTop: 12 }}>
              {[
                ['Name',     user?.name],
                ['Email',    user?.email],
                ['Phone',    user?.phone],
                ['Business', user?.businessName],
                ['Type',     user?.businessType || '—'],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid var(--bg)' }}>
                  <span style={{ color: 'var(--text3)', fontSize: 13 }}>{k}</span>
                  <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)' }}>{v}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Change Password ── */}
        <div className="card card-p" style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: showPw ? 16 : 0 }}>
            <p style={{ fontWeight: 700, fontSize: 15 }}>🔐 Change Password</p>
            <button onClick={() => setShowPw(s => !s)} style={{ color: 'var(--blue)', fontWeight: 700, fontSize: 13, background: 'var(--blue-lt)', padding: '5px 14px', borderRadius: 50, border: 'none', cursor: 'pointer' }}>
              {showPw ? 'Cancel' : 'Change'}
            </button>
          </div>

          {showPw && (
            <>
              {/* Current password */}
              <div className="field">
                <label>Current Password</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type={showPass.current ? 'text' : 'password'} placeholder="Enter current password" value={pwForm.currentPassword} onChange={setPw('currentPassword')} autoFocus style={{ ...inputStyle, flex: 1 }} />
                  <button type="button" onClick={() => setShowPass(s => ({ ...s, current: !s.current }))} style={{ fontSize: 15, color: 'var(--text3)', background: 'none', border: 'none', cursor: 'pointer' }}>{showPass.current ? '🙈' : '👁️'}</button>
                </div>
              </div>

              {/* New password */}
              <div className="field">
                <label>New Password</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type={showPass.new ? 'text' : 'password'} placeholder="Min. 6 characters" value={pwForm.newPassword} onChange={setPw('newPassword')} style={{ ...inputStyle, flex: 1 }} />
                  <button type="button" onClick={() => setShowPass(s => ({ ...s, new: !s.new }))} style={{ fontSize: 15, color: 'var(--text3)', background: 'none', border: 'none', cursor: 'pointer' }}>{showPass.new ? '🙈' : '👁️'}</button>
                </div>
              </div>

              {/* Confirm new password */}
              <div className="field">
                <label>Confirm New Password</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type={showPass.confirm ? 'text' : 'password'} placeholder="Re-enter new password" value={pwForm.confirmNewPassword} onChange={setPw('confirmNewPassword')} style={{ ...inputStyle, flex: 1 }} />
                  <button type="button" onClick={() => setShowPass(s => ({ ...s, confirm: !s.confirm }))} style={{ fontSize: 15, color: 'var(--text3)', background: 'none', border: 'none', cursor: 'pointer' }}>{showPass.confirm ? '🙈' : '👁️'}</button>
                </div>
                {pwForm.confirmNewPassword && pwForm.newPassword !== pwForm.confirmNewPassword && (
                  <p style={{ fontSize: 11, color: 'var(--red)', marginTop: 4 }}>⚠️ Passwords do not match</p>
                )}
                {pwForm.confirmNewPassword && pwForm.newPassword === pwForm.confirmNewPassword && pwForm.newPassword.length >= 6 && (
                  <p style={{ fontSize: 11, color: 'var(--green)', marginTop: 4 }}>✅ Passwords match</p>
                )}
              </div>

              <button className="btn btn-primary btn-full" onClick={savePassword} disabled={loading} style={{ padding: 14 }}>
                {loading ? 'Updating…' : '🔐 Update Password'}
              </button>
            </>
          )}
        </div>

        {/* ── App Info ── */}
        <div className="card card-p" style={{ marginBottom: 12 }}>
          <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 12 }}>ℹ️ About CreditBook</p>
          {[
            ['App',     'CreditBook v2.0'],
            ['AI',      'Groq (free — no credit card)'],
            ['Model',   'Llama 3.3 70B'],
            ['Stack',   'MERN + PWA'],
            ['Auth',    'Email + Password'],
          ].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--bg)' }}>
              <span style={{ color: 'var(--text3)', fontSize: 13 }}>{k}</span>
              <span style={{ fontWeight: 600, fontSize: 13 }}>{v}</span>
            </div>
          ))}
        </div>

        {/* Groq setup info
        <div style={{ background: '#fffbe6', border: '1.5px solid #f0c040', borderRadius: 'var(--r)', padding: 14, marginBottom: 14 }}>
          <p style={{ fontWeight: 700, fontSize: 13, color: '#b8860b', marginBottom: 6 }}>💡 Enable AI Chatbot (Free)</p>
          <p style={{ fontSize: 12, color: '#8b6914', lineHeight: 1.6 }}>
            1. Go to <strong>console.groq.com</strong> → Sign up free<br />
            2. Create API Key → copy it<br />
            3. Add to <strong>backend/.env</strong>:<br />
            <code style={{ background: '#fef3cd', padding: '2px 6px', borderRadius: 4, fontSize: 11 }}>GROQ_API_KEY=gsk_...</code><br />
            4. Restart backend server
          </p>
        </div> */}

        {/* Logout */}
        <button className="btn btn-full" onClick={() => setShowLogout(true)}
          style={{ padding: 14, background: 'var(--red-lt)', color: 'var(--red)', borderRadius: 50, fontWeight: 700, fontSize: 14, border: '1.5px solid var(--red)', marginBottom: 8 }}>
          🚪 Logout
        </button>
      </div>

      {/* Logout confirm modal */}
      {showLogout && (
        <div className="overlay" onClick={() => setShowLogout(false)}>
          <div className="sheet" onClick={e => e.stopPropagation()}>
            <h3 style={{ fontWeight: 800, marginBottom: 6 }}>Logout?</h3>
            <p style={{ color: 'var(--text2)', fontSize: 14, marginBottom: 20 }}>Are you sure you want to logout from CreditBook?</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-ghost btn-full" onClick={() => setShowLogout(false)}>Cancel</button>
              <button className="btn btn-red btn-full" onClick={logout}>Yes, Logout</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
