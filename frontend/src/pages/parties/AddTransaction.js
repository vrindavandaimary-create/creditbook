import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { fmt, todayStr } from '../../utils/helpers';

export default function AddTransaction() {
  const { id } = useParams();
  const [sp]   = useSearchParams();
  const txType = sp.get('type') || 'got';
  const navigate = useNavigate();
  const [party,  setParty]  = useState(null);
  const [amount, setAmount] = useState('');
  const [desc,   setDesc]   = useState('');
  const [date,   setDate]   = useState(todayStr());
  const [loading, setLoading] = useState(false);
  const isGot = txType === 'got';

  useEffect(() => {
    axios.get(`/api/parties/${id}`)
      .then(r => setParty(r.data.data.party))
      .catch(() => { toast.error('Party not found'); navigate(-1); });
  }, [id, navigate]);

  const submit = async (e) => {
    e.preventDefault();
    const n = parseFloat(amount);
    if (!n || n <= 0) return toast.error('Enter a valid amount');
    setLoading(true);
    try {
      await axios.post('/api/transactions', { partyId:id, type:txType, amount:n, description:desc, date });
      toast.success('Entry saved!');
      navigate(`/parties/${id}`, { replace:true });
    } catch(err) { toast.error(err.response?.data?.message||'Failed'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ background:'var(--bg)', minHeight:'100vh' }}>
      <div style={{ background:isGot?'linear-gradient(135deg,#1a9e5c,#166040)':'linear-gradient(135deg,#e53935,#b71c1c)', padding:'16px 16px 20px', color:'white' }}>
        <div className="hdr-row">
          <button className="back-btn" onClick={()=>navigate(-1)}>←</button>
          <h2 style={{ fontSize:17, fontWeight:800, margin:0, flex:1 }}>
            {isGot?`You got ₹ from ${party?.name||'…'}`:`You gave ₹ to ${party?.name||'…'}`}
          </h2>
        </div>
        {party && (
          <div style={{ background:'rgba(255,255,255,.12)', borderRadius:10, padding:'8px 14px', marginTop:8, fontSize:13 }}>
            Current balance: <strong>₹{fmt(Math.abs(party.balance),2)}</strong>
            {' '}{party.balance>0?'(to get)':party.balance<0?'(to give)':'(settled)'}
          </div>
        )}
      </div>
      <form onSubmit={submit} style={{ padding:16 }}>
        <div className="card" style={{ padding:'16px 20px', marginBottom:14, display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ fontSize:32, fontWeight:800, color:isGot?'var(--green)':'var(--red)' }}>₹</span>
          <input type="number" inputMode="decimal" placeholder="0.00" value={amount} onChange={e=>setAmount(e.target.value)}
            autoFocus min="0.01" step="0.01"
            style={{ flex:1, fontSize:36, fontWeight:800, color:isGot?'var(--green)':'var(--red)', background:'transparent', border:'none' }} />
        </div>
        <div className="field"><label>Details (optional)</label><input placeholder="Items, bill no., notes…" value={desc} onChange={e=>setDesc(e.target.value)} /></div>
        <div className="field"><label>Date</label><input type="date" value={date} onChange={e=>setDate(e.target.value)} max={todayStr()} /></div>
        <button type="submit" className={`btn btn-full ${isGot?'btn-green':'btn-red'}`} style={{ padding:15, marginTop:8 }} disabled={loading}>
          {loading?'Saving…':'SAVE'}
        </button>
      </form>
    </div>
  );
}
