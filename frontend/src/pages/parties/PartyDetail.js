import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { fmt, fmtDateTime, avatarLetter } from '../../utils/helpers';

export default function PartyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [party,  setParty]  = useState(null);
  const [txs,    setTxs]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDel, setShowDel] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    try {
      const r = await axios.get(`/api/parties/${id}`);
      setParty(r.data.data.party);
      setTxs(r.data.data.transactions);
    } catch { toast.error('Failed to load'); navigate(-1); }
    finally { setLoading(false); }
  }, [id, navigate]);

  useEffect(() => { load(); }, [load]);

  const delTx = async (txId) => {
    try { await axios.delete(`/api/transactions/${txId}`); toast.success('Deleted'); load(); }
    catch { toast.error('Failed'); }
  };

  const delParty = async () => {
    setDeleting(true);
    try { await axios.delete(`/api/parties/${id}`); toast.success('Deleted'); navigate(-1); }
    catch { toast.error('Failed'); setDeleting(false); }
  };

  if (loading) return <div className="spinner"><div className="spin"/></div>;
  if (!party)  return null;

  const isCust = party.type === 'customer';
  const grad   = isCust ? 'linear-gradient(135deg,#1a4fd6,#0e2a8a)' : 'linear-gradient(135deg,#1a7a46,#0f4a2a)';

  return (
    <div style={{ background:'var(--bg)', minHeight:'100vh', paddingBottom:90 }}>
      {/* Header */}
      <div style={{ background:grad, padding:'16px 16px 20px', color:'white' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
          <button className="back-btn" onClick={()=>navigate(-1)}>←</button>
          <div className="avatar av-sm" style={{ background:'rgba(255,255,255,.2)' }}>{avatarLetter(party.name)}</div>
          <div style={{ flex:1, minWidth:0 }}>
            <h2 style={{ fontSize:18, fontWeight:800, margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{party.name}</h2>
            <p style={{ opacity:.7, fontSize:12, marginTop:2 }}>{party.phone||'No phone'}</p>
          </div>
          <button onClick={()=>setShowDel(true)} style={{ background:'rgba(255,255,255,.15)', borderRadius:10, padding:'7px 11px', color:'white', fontSize:18 }}>⋮</button>
        </div>
        <div style={{ background:'rgba(255,255,255,.13)', borderRadius:14, padding:'14px 16px', textAlign:'center' }}>
          <p style={{ opacity:.75, fontSize:12, marginBottom:4 }}>{party.balance>0?'You will get':party.balance<0?'You will give':'All settled ✅'}</p>
          <p style={{ fontSize:32, fontWeight:800 }}>₹{fmt(Math.abs(party.balance),2)}</p>
        </div>
      </div>

      <div style={{ padding:'14px 14px 0' }}>
        {txs.length===0 ? (
          <div className="empty"><div className="ico">📋</div><h3>No entries yet</h3><p>Use buttons below to record transactions</p></div>
        ) : (
          <div className="card" style={{ overflow:'hidden', marginBottom:16 }}>
            {txs.map(tx=>(
              <div key={tx._id} className="tx-item">
                <div style={{ flex:1, minWidth:0 }}>
                  <p className="tx-date">{fmtDateTime(tx.date)}</p>
                  {tx.description && <p className="tx-desc">{tx.description}</p>}
                  <p style={{ fontSize:11, color:'var(--text4)', marginTop:2 }}>Bal: ₹{fmt(tx.balanceAfter||0,2)}</p>
                </div>
                <div style={{ textAlign:'right', marginLeft:10 }}>
                  <p className={tx.type==='got'?'pos':'neg'} style={{ fontSize:16 }}>
                    {tx.type==='got'?'+':'-'}₹{fmt(tx.amount,2)}
                  </p>
                  <p style={{ fontSize:10, color:'var(--text4)', marginTop:2 }}>{tx.type==='got'?'Received':'Given'}</p>
                  <button onClick={()=>delTx(tx._id)} style={{ fontSize:10, color:'var(--text4)', marginTop:4, padding:'2px 6px', borderRadius:4, background:'var(--bg)' }}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom action buttons */}
      <div style={{ position:'fixed', bottom:'var(--nav-h)', left:'50%', transform:'translateX(-50%)', width:'100%', maxWidth:'var(--maxw)', padding:'10px 14px', display:'flex', gap:10, background:'white', borderTop:'1px solid var(--border)', zIndex:200 }}>
        <button className="btn btn-red btn-full" onClick={()=>navigate(`/parties/${id}/transaction?type=gave`)}>YOU GAVE ₹</button>
        <button className="btn btn-green btn-full" onClick={()=>navigate(`/parties/${id}/transaction?type=got`)}>YOU GOT ₹</button>
      </div>

      {showDel && (
        <div className="overlay" onClick={()=>setShowDel(false)}>
          <div className="sheet" onClick={e=>e.stopPropagation()}>
            <h3 style={{ fontWeight:800, marginBottom:6 }}>Delete {party.name}?</h3>
            <p style={{ color:'var(--text2)', fontSize:14, marginBottom:20 }}>This permanently deletes this {party.type} and all their transactions.</p>
            <div style={{ display:'flex', gap:10 }}>
              <button className="btn btn-ghost btn-full" onClick={()=>setShowDel(false)}>Cancel</button>
              <button className="btn btn-red btn-full" onClick={delParty} disabled={deleting}>{deleting?'Deleting…':'Delete'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
