import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { fmt, fmtDate } from '../utils/helpers';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try { const r = await axios.get('/api/dashboard'); setData(r.data.data); }
    catch(e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const today = new Date().toLocaleDateString('en-IN',{ weekday:'short', day:'numeric', month:'short', year:'numeric' });

  if (loading) return <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}><div className="spin"/></div>;

  const d = data || {};

  return (
    <div style={{ background:'var(--bg)', minHeight:'100vh', paddingBottom:80 }}>
      <div className="grad-blue" style={{ padding:'20px 16px 24px', color:'white' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 }}>
          <div>
            <p style={{ opacity:.7, fontSize:12, marginBottom:2 }}>👋 Hello,</p>
            <h2 style={{ fontSize:22, fontWeight:800, margin:0 }}>{user?.name}</h2>
            <p style={{ opacity:.65, fontSize:12, marginTop:3 }}>💳 {user?.businessName}</p>
          </div>
          <div style={{ background:'rgba(255,255,255,.14)', borderRadius:10, padding:'7px 12px', fontSize:11, fontWeight:600 }}>📅 {today}</div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
          {[
            { label:'Today In',  value:d.today?.in  ||0, color:'#4ade80' },
            { label:'Today Out', value:d.today?.out ||0, color:'#f87171' },
            { label:'Net',       value:d.today?.net ||0, color:(d.today?.net||0)>=0?'#4ade80':'#f87171' },
          ].map(s=>(
            <div key={s.label} style={{ background:'rgba(255,255,255,.12)', borderRadius:12, padding:'10px 10px' }}>
              <p style={{ fontSize:10, opacity:.75, marginBottom:3 }}>{s.label}</p>
              <p style={{ fontSize:15, fontWeight:800, color:s.color }}>₹{fmt(s.value,0)}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding:'14px 14px 0' }}>
        {/* Customers */}
        <p className="sec-title">👥 Customers</p>
        <div className="card card-p" style={{ marginBottom:14, cursor:'pointer' }} onClick={()=>navigate('/customers')}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
            <span style={{ fontSize:15, fontWeight:700, display:'flex', alignItems:'center', gap:7 }}>Customers <span className="badge badge-blue">{d.customers?.count||0}</span></span>
            <span style={{ color:'var(--blue)', fontSize:12, fontWeight:600 }}>View all →</span>
          </div>
          <div style={{ display:'flex' }}>
            <div style={{ flex:1, borderRight:'1px solid var(--border)', paddingRight:14 }}>
              <p style={{ fontSize:11, color:'var(--text3)', marginBottom:3 }}>You will give</p>
              <p className="give" style={{ fontSize:22 }}>₹{fmt(d.customers?.toGive||0,0)}</p>
            </div>
            <div style={{ flex:1, paddingLeft:14 }}>
              <p style={{ fontSize:11, color:'var(--text3)', marginBottom:3 }}>You will get</p>
              <p className="get" style={{ fontSize:22 }}>₹{fmt(d.customers?.toGet||0,0)}</p>
            </div>
          </div>
          <button className="btn btn-primary btn-full" style={{ marginTop:12, padding:'10px', fontSize:13 }} onClick={e=>{e.stopPropagation();navigate('/parties/add/customer');}}>+ Add Customer</button>
        </div>

        {/* Suppliers */}
        <p className="sec-title">🏪 Suppliers</p>
        <div className="card card-p" style={{ marginBottom:14, cursor:'pointer' }} onClick={()=>navigate('/suppliers')}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
            <span style={{ fontSize:15, fontWeight:700, display:'flex', alignItems:'center', gap:7 }}>Suppliers <span className="badge badge-green">{d.suppliers?.count||0}</span></span>
            <span style={{ color:'var(--blue)', fontSize:12, fontWeight:600 }}>View all →</span>
          </div>
          <div style={{ display:'flex' }}>
            <div style={{ flex:1, borderRight:'1px solid var(--border)', paddingRight:14 }}>
              <p style={{ fontSize:11, color:'var(--text3)', marginBottom:3 }}>You will give</p>
              <p className="give" style={{ fontSize:22 }}>₹{fmt(d.suppliers?.toGive||0,0)}</p>
            </div>
            <div style={{ flex:1, paddingLeft:14 }}>
              <p style={{ fontSize:11, color:'var(--text3)', marginBottom:3 }}>You will get</p>
              <p className="get" style={{ fontSize:22 }}>₹{fmt(d.suppliers?.toGet||0,0)}</p>
            </div>
          </div>
          <button className="btn btn-green btn-full" style={{ marginTop:12, padding:'10px', fontSize:13 }} onClick={e=>{e.stopPropagation();navigate('/parties/add/supplier');}}>+ Add Supplier</button>
        </div>

        {/* Net + Month */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:14 }}>
          <div className="card card-p">
            <p style={{ fontSize:12, fontWeight:700, marginBottom:4 }}>💼 Net Position</p>
            <p style={{ fontSize:20, fontWeight:800, color:(d.netPosition||0)>=0?'var(--green)':'var(--red)' }}>{(d.netPosition||0)>=0?'+':''}₹{fmt(d.netPosition||0,0)}</p>
          </div>
          <div className="card card-p">
            <p style={{ fontSize:12, fontWeight:700, marginBottom:4 }}>📅 This Month</p>
            <p className="pos" style={{ fontSize:16 }}>+₹{fmt(d.thisMonth?.in||0,0)}</p>
            <p className="neg" style={{ fontSize:14, marginTop:2 }}>-₹{fmt(d.thisMonth?.out||0,0)}</p>
          </div>
        </div>

        {/* Recent Transactions */}
        {d.recentTransactions?.length > 0 && (
          <>
            <p className="sec-title">Recent Transactions</p>
            <div className="card" style={{ overflow:'hidden', marginBottom:16 }}>
              {d.recentTransactions.slice(0,8).map(tx=>(
                <div key={tx._id} className="tx-item">
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontSize:14, fontWeight:700 }}>{tx.partyId?.name||'—'}</p>
                    <p className="tx-date">{fmtDate(tx.date)}</p>
                    {tx.description && <p className="tx-desc">{tx.description}</p>}
                  </div>
                  <div style={{ textAlign:'right', marginLeft:10 }}>
                    <p className={tx.type==='got'?'pos':'neg'} style={{ fontSize:15 }}>{tx.type==='got'?'+':'-'}₹{fmt(tx.amount,2)}</p>
                    <p style={{ fontSize:10, color:'var(--text4)', marginTop:2 }}>{tx.type==='got'?'Received':'Given'}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
        {!d.recentTransactions?.length && (
          <div className="empty" style={{ paddingTop:24 }}>
            <div className="ico">📊</div>
            <h3>No transactions yet</h3>
            <p>Add customers or suppliers to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}
