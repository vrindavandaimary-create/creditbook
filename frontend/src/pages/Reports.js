import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { fmt } from '../utils/helpers';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function Reports() {
  const [dash,  setDash]  = useState(null);
  const [flow,  setFlow]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get('/api/dashboard'),
      axios.get('/api/dashboard/cashflow?days=7'),
    ]).then(([d, f]) => {
      setDash(d.data.data);
      setFlow(f.data.data.map(item => ({
        ...item,
        day: new Date(item.date).toLocaleDateString('en-IN',{day:'2-digit',month:'short'})
      })));
    }).catch(e=>console.error(e))
    .finally(()=>setLoading(false));
  }, []);

  if (loading) return <div className="spinner"><div className="spin"/></div>;
  const d = dash || {};

  const pieData = [
    { name:'Cust. Receivable', value: d.customers?.toGet  || 0, color:'#e53935' },
    { name:'Cust. Payable',    value: d.customers?.toGive || 0, color:'#1a4fd6' },
    { name:'Supp. Payable',    value: d.suppliers?.toGive || 0, color:'#f57c00' },
    { name:'Supp. Receivable', value: d.suppliers?.toGet  || 0, color:'#1a9e5c' },
  ].filter(p=>p.value>0);

  return (
    <div style={{ background:'var(--bg)', minHeight:'100vh', paddingBottom:80 }}>
      <div className="grad-blue" style={{ padding:'18px 16px 24px', color:'white' }}>
        <h2 style={{ fontSize:20, fontWeight:800 }}>📊 Reports</h2>
        <p style={{ opacity:.7, fontSize:12, marginTop:4 }}>Business financial overview</p>
      </div>

      <div style={{ padding:'14px 14px 0' }}>
        {/* Summary grid */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:14 }}>
          {[
            { label:'Customer Receivable', value:d.customers?.toGet  ||0, color:'#e53935', icon:'👥' },
            { label:'Customer Payable',    value:d.customers?.toGive ||0, color:'#1a4fd6', icon:'💰' },
            { label:'Supplier Payable',    value:d.suppliers?.toGive ||0, color:'#f57c00', icon:'🏪' },
            { label:'Supplier Receivable', value:d.suppliers?.toGet  ||0, color:'#1a9e5c', icon:'✅' },
          ].map((s,i)=>(
            <div key={i} className="card card-p">
              <p style={{ fontSize:18 }}>{s.icon}</p>
              <p style={{ fontSize:10, color:'var(--text3)', margin:'4px 0' }}>{s.label}</p>
              <p style={{ fontSize:16, fontWeight:800, color:s.color }}>₹{fmt(s.value,0)}</p>
            </div>
          ))}
        </div>

        {/* Bar chart */}
        <div className="card card-p" style={{ marginBottom:14 }}>
          <p style={{ fontWeight:700, marginBottom:12, fontSize:14 }}>📈 Cash Flow — Last 7 Days</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={flow} margin={{ top:0, right:0, bottom:0, left:-20 }}>
              <XAxis dataKey="day" tick={{ fontSize:10, fill:'#9aa0c0' }} />
              <YAxis tick={{ fontSize:10, fill:'#9aa0c0' }} />
              <Tooltip formatter={(v)=>`₹${fmt(v,0)}`} contentStyle={{ borderRadius:8, fontSize:12 }} />
              <Bar dataKey="in"  name="Received" fill="#1a9e5c" radius={[4,4,0,0]} />
              <Bar dataKey="out" name="Given"    fill="#e53935" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
          <div style={{ display:'flex', gap:16, justifyContent:'center', marginTop:8 }}>
            <span style={{ fontSize:12, color:'#1a9e5c', fontWeight:700 }}>● Received</span>
            <span style={{ fontSize:12, color:'#e53935', fontWeight:700 }}>● Given</span>
          </div>
        </div>

        {/* Pie chart */}
        {pieData.length > 0 && (
          <div className="card card-p" style={{ marginBottom:14 }}>
            <p style={{ fontWeight:700, marginBottom:12, fontSize:14 }}>🥧 Balance Distribution</p>
            <div style={{ display:'flex', alignItems:'center' }}>
              <PieChart width={150} height={150}>
                <Pie data={pieData} cx={70} cy={70} innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                  {pieData.map((e,i)=><Cell key={i} fill={e.color}/>)}
                </Pie>
                <Tooltip formatter={(v)=>`₹${fmt(v,0)}`} />
              </PieChart>
              <div style={{ flex:1, paddingLeft:10 }}>
                {pieData.map((p,i)=>(
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                    <span style={{ width:10, height:10, borderRadius:3, background:p.color, display:'inline-block', flexShrink:0 }}/>
                    <div>
                      <p style={{ fontSize:10, color:'var(--text2)' }}>{p.name}</p>
                      <p style={{ fontSize:13, fontWeight:700, color:p.color }}>₹{fmt(p.value,0)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Net position */}
        <div className="card card-p" style={{ marginBottom:14 }}>
          <p style={{ fontWeight:700, marginBottom:12, fontSize:14 }}>💼 Net Business Position</p>
          {(() => {
            const net = (d.customers?.toGet||0)-(d.customers?.toGive||0)-(d.suppliers?.toGive||0)+(d.suppliers?.toGet||0);
            return (
              <div style={{ textAlign:'center', padding:'12px 0' }}>
                <p style={{ fontSize:34, fontWeight:800, color:net>=0?'var(--green)':'var(--red)' }}>
                  {net>=0?'+':''}₹{fmt(net,2)}
                </p>
                <p style={{ fontSize:13, color:'var(--text3)', marginTop:4 }}>
                  {net>=0?'You are in a net receivable position':'You are in a net payable position'}
                </p>
              </div>
            );
          })()}
        </div>

        {/* Top customers */}
        {d.topCustomers?.length > 0 && (
          <div className="card" style={{ overflow:'hidden', marginBottom:14 }}>
            <div style={{ padding:'12px 16px', borderBottom:'1px solid var(--border)' }}>
              <p style={{ fontWeight:700, fontSize:14 }}>🔴 Top Customer Dues</p>
            </div>
            {d.topCustomers.map(c=>(
              <div key={c._id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 16px', borderBottom:'1px solid var(--border)' }}>
                <span style={{ fontSize:14, fontWeight:600 }}>{c.name}</span>
                <span className="get" style={{ fontSize:14 }}>₹{fmt(c.balance,0)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
