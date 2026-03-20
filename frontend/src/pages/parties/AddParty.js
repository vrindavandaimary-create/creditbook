import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function AddParty() {
  const { type } = useParams();
  const navigate  = useNavigate();
  const isCust    = type === 'customer';
  const [form, setForm] = useState({ name:'', phone:'', email:'', address:'', notes:'' });
  const [loading, setLoading] = useState(false);
  const set = k => e => setForm(f=>({...f,[k]:e.target.value}));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Name is required');
    setLoading(true);
    try {
      const r = await axios.post('/api/parties', { ...form, type });
      toast.success(`${isCust?'Customer':'Supplier'} added!`);
      navigate(`/parties/${r.data.data._id}`, { replace:true });
    } catch(err) { toast.error(err.response?.data?.message||'Failed'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ background:'var(--bg)', minHeight:'100vh' }}>
      <div style={{ background: isCust?'linear-gradient(135deg,#1a4fd6,#0e2a8a)':'linear-gradient(135deg,#1a7a46,#0f4a2a)', padding:'16px 16px 24px', color:'white' }}>
        <div className="hdr-row">
          <button className="back-btn" onClick={()=>navigate(-1)}>←</button>
          <h2 style={{ fontSize:18, fontWeight:800, margin:0 }}>Add {isCust?'Customer':'Supplier'}</h2>
        </div>
      </div>
      <form onSubmit={submit} style={{ padding:16 }}>
        <div className="field"><label>Name *</label><input placeholder="Full name" value={form.name} onChange={set('name')} autoFocus /></div>
        <div className="field"><label>Phone Number</label><input type="tel" placeholder="Mobile (optional)" value={form.phone} onChange={set('phone')} inputMode="numeric" /></div>
        <div className="field"><label>Email</label><input type="email" placeholder="Email (optional)" value={form.email} onChange={set('email')} /></div>
        <div className="field"><label>Address</label><input placeholder="Address (optional)" value={form.address} onChange={set('address')} /></div>
        <div className="field"><label>Notes</label><textarea rows={3} placeholder="Any notes…" value={form.notes} onChange={set('notes')} /></div>
        <button type="submit" className={`btn btn-full ${isCust?'btn-primary':'btn-green'}`} style={{ padding:15, marginTop:6 }} disabled={loading}>
          {loading?'Adding…':`Add ${isCust?'Customer':'Supplier'}`}
        </button>
      </form>
    </div>
  );
}
