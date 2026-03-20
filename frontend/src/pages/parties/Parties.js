import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { fmt, avatarColor, avatarLetter } from '../../utils/helpers';

export default function Parties({ type }) {
  const navigate = useNavigate();
  const [parties, setParties] = useState([]);
  const [totals,  setTotals]  = useState({});
  const [search,  setSearch]  = useState('');
  const [loading, setLoading] = useState(true);
  const isCust = type === 'customer';

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [pR, tR] = await Promise.all([
        axios.get('/api/parties', { params: { type, search } }),
        axios.get('/api/parties/summary/totals'),
      ]);
      setParties(pR.data.data);
      setTotals(tR.data.data);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  }, [type, search]);

  useEffect(() => { load(); }, [load]);

  const toGet  = isCust ? totals.customerToGet  : totals.supplierToGet;
  const toGive = isCust ? totals.customerToGive : totals.supplierToGive;

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', paddingBottom:90 }}>
      {/* Header */}
      <div className={isCust?'grad-blue':'grad-green'} style={{ padding:'18px 16px 0', color:'white' }}>
        <h2 style={{ fontSize:20, fontWeight:800, marginBottom:14 }}>{isCust?'👥 Customers':'🏪 Suppliers'}</h2>
        {/* Summary */}
        <div style={{ background:'rgba(255,255,255,.13)', borderRadius:14, padding:'12px 16px', display:'flex', marginBottom:16 }}>
          <div style={{ flex:1, borderRight:'1px solid rgba(255,255,255,.2)', paddingRight:14 }}>
            <p style={{ fontSize:11, opacity:.75, marginBottom:2 }}>You will give</p>
            <p style={{ fontSize:22, fontWeight:800 }}>₹{fmt(toGive||0,0)}</p>
          </div>
          <div style={{ flex:1, paddingLeft:14 }}>
            <p style={{ fontSize:11, opacity:.75, marginBottom:2 }}>You will get</p>
            <p style={{ fontSize:22, fontWeight:800 }}>₹{fmt(toGet||0,0)}</p>
          </div>
        </div>
      </div>

      <div style={{ padding:'14px 14px 0' }}>
        <div className="searchbar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input placeholder={`Search ${type}s…`} value={search} onChange={e=>setSearch(e.target.value)} />
          {search && <button onClick={()=>setSearch('')} style={{ color:'var(--text3)', fontSize:18 }}>×</button>}
        </div>

        {loading ? <div className="spinner"><div className="spin"/></div>
        : parties.length === 0 ? (
          <div className="empty">
            <div className="ico">{isCust?'👥':'🏪'}</div>
            <h3>No {type}s yet</h3>
            <p>Tap below to add your first {type}</p>
          </div>
        ) : parties.map(p=>(
          <div key={p._id} className="list-item" onClick={()=>navigate(`/parties/${p._id}`)}>
            <div className="avatar" style={{ background:avatarColor(p.name) }}>{avatarLetter(p.name)}</div>
            <div className="li-info">
              <h3>{p.name}</h3>
              <p>{p.phone||'No phone'}</p>
            </div>
            <div className="li-right">
              <p className={p.balance>=0?'get':'give'} style={{ fontSize:16 }}>₹{fmt(Math.abs(p.balance),2)}</p>
              <p style={{ fontSize:10, color:'var(--text4)', marginTop:2 }}>
                {p.balance>0?'will get':p.balance<0?'will give':'settled'}
              </p>
              {p.balance>0 && <p style={{ fontSize:10, color:'var(--blue)', fontWeight:700, marginTop:2 }}>REMIND ›</p>}
            </div>
          </div>
        ))}
      </div>

      <button className={`fab ${isCust?'fab-pink':'fab-green'}`} onClick={()=>navigate(`/parties/add/${type}`)}>
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
        ADD {isCust?'CUSTOMER':'SUPPLIER'}
      </button>
    </div>
  );
}
