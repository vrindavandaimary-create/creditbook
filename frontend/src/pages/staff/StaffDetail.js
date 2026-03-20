import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { fmt, fmtDate, getCalDays, isSameDay, isToday, ATT_LABEL, ATT_BG, ATT_BORDER, ATT_COLOR } from '../../utils/helpers';

const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function StaffDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [staff,    setStaff]    = useState(null);
  const [att,      setAtt]      = useState([]);
  const [attSum,   setAttSum]   = useState({});
  const [viewDate, setViewDate] = useState(new Date());
  const [loading,  setLoading]  = useState(true);
  const [selDay,   setSelDay]   = useState(null);
  const [showPay,  setShowPay]  = useState(false);
  const [payForm,  setPayForm]  = useState({ amount:'', type:'salary', description:'' });
  const [payLoading, setPayLoading] = useState(false);

  const loadAtt = useCallback(async (d) => {
    try {
      const [aR, sR] = await Promise.all([
        axios.get(`/api/attendance/${id}`, { params:{ month: d.getMonth()+1, year: d.getFullYear() } }),
        axios.get(`/api/attendance/${id}/summary`, { params:{ month: d.getMonth()+1, year: d.getFullYear() } }),
      ]);
      setAtt(aR.data.data);
      setAttSum(sR.data.data);
    } catch(e) { console.error(e); }
  }, [id]);

  useEffect(() => {
    const init = async () => {
      try { const r = await axios.get(`/api/staff/${id}`); setStaff(r.data.data); }
      catch { toast.error('Staff not found'); navigate(-1); return; }
      await loadAtt(new Date());
      setLoading(false);
    };
    init();
  }, [id, navigate, loadAtt]);

  const changeMonth = (dir) => {
    const d = new Date(viewDate);
    d.setMonth(d.getMonth() + dir);
    setViewDate(d);
    loadAtt(d);
  };

  const getAttForDay = (day) => att.find(a => isSameDay(new Date(a.date), day));

  const markDay = async (day, status) => {
    try {
      await axios.post('/api/attendance', { staffId:id, date:day.toISOString(), status });
      toast.success(`✅ ${ATT_LABEL[status]}`);
      loadAtt(viewDate);
      setSelDay(null);
    } catch(e) { toast.error(e.response?.data?.message||'Failed'); }
  };

  const addPayment = async () => {
    if (!payForm.amount || Number(payForm.amount) <= 0) return toast.error('Enter valid amount');
    setPayLoading(true);
    try {
      await axios.post(`/api/staff/${id}/payment`, { ...payForm, amount: Number(payForm.amount) });
      toast.success('Payment recorded!');
      const r = await axios.get(`/api/staff/${id}`); setStaff(r.data.data);
      setShowPay(false); setPayForm({ amount:'', type:'salary', description:'' });
    } catch(e) { toast.error(e.response?.data?.message||'Failed'); }
    finally { setPayLoading(false); }
  };

  if (loading || !staff) return <div className="spinner"><div className="spin"/></div>;

  const calDays = getCalDays(viewDate.getFullYear(), viewDate.getMonth());

  return (
    <div style={{ background:'var(--bg)', minHeight:'100vh', paddingBottom:90 }}>
      <div className="grad-blue" style={{ padding:'16px 16px 20px', color:'white' }}>
        <div className="hdr-row">
          <button className="back-btn" onClick={()=>navigate(-1)}>←</button>
          <div>
            <h2 style={{ fontSize:18, fontWeight:800, margin:0 }}>{staff.name}</h2>
            <p style={{ opacity:.7, fontSize:12, marginTop:2 }}>₹{fmt(staff.salary,0)}/{staff.salaryType}{staff.role?` · ${staff.role}`:''}</p>
          </div>
        </div>
      </div>

      <div style={{ padding:'14px 14px 0' }}>
        {/* Month stats */}
        <div style={{ display:'flex', gap:8, marginBottom:14, flexWrap:'wrap' }}>
          {Object.entries(ATT_LABEL).map(([k,v])=>(
            <span key={k} style={{ background:ATT_BG[k], border:`1px solid ${ATT_BORDER[k]}`, borderRadius:50, padding:'5px 12px', fontSize:12, fontWeight:700, color:ATT_COLOR[k] }}>
              {v}: {attSum.summary?.[k]||0}
            </span>
          ))}
        </div>

        {attSum.salaryEarned !== undefined && (
          <div className="card card-p" style={{ marginBottom:14, display:'flex', gap:0 }}>
            <div style={{ flex:1, borderRight:'1px solid var(--border)', paddingRight:12 }}>
              <p style={{ fontSize:11, color:'var(--text3)', marginBottom:2 }}>Salary Earned</p>
              <p className="pos" style={{ fontSize:18 }}>₹{fmt(attSum.salaryEarned,2)}</p>
            </div>
            <div style={{ flex:1, paddingLeft:12 }}>
              <p style={{ fontSize:11, color:'var(--text3)', marginBottom:2 }}>Advance Balance</p>
              <p style={{ fontSize:18, fontWeight:800, color:'var(--orange)' }}>₹{fmt(staff.advanceBalance,2)}</p>
            </div>
          </div>
        )}

        {/* Calendar */}
        <div className="card" style={{ padding:14, marginBottom:14 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
            <button onClick={()=>changeMonth(-1)} style={{ background:'none', fontSize:22, color:'var(--blue)', padding:'0 8px' }}>‹</button>
            <span style={{ fontWeight:800, fontSize:15 }}>{MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}</span>
            <button onClick={()=>changeMonth(1)}  style={{ background:'none', fontSize:22, color:'var(--blue)', padding:'0 8px' }}>›</button>
          </div>
          {/* Day headers */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:2, marginBottom:4 }}>
            {DAYS.map(d=><div key={d} style={{ textAlign:'center', fontSize:10, fontWeight:700, color:'var(--text3)', padding:'3px 0' }}>{d}</div>)}
          </div>
          {/* Day cells */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:3 }}>
            {calDays.map((day, i) => {
              if (!day) return <div key={i}/>;
              const a   = getAttForDay(day);
              const tod = isToday(day);
              return (
                <div key={i}
                  className={`att-cell${tod&&!a?' today-cell':''} ${a?a.status:''}`}
                  onClick={()=>setSelDay(day)}>
                  {day.getDate()}
                </div>
              );
            })}
          </div>
          {/* Legend */}
          <div style={{ display:'flex', gap:10, marginTop:12, flexWrap:'wrap' }}>
            {Object.entries(ATT_LABEL).map(([k,v])=>(
              <span key={k} style={{ display:'flex', alignItems:'center', gap:4, fontSize:11, color:'var(--text2)' }}>
                <span style={{ width:10, height:10, borderRadius:3, background:ATT_BG[k], border:`1px solid ${ATT_BORDER[k]}`, display:'inline-block' }}/>
                {v}
              </span>
            ))}
          </div>
        </div>

        {/* Payment section */}
        <div className="card card-p" style={{ marginBottom:14 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
            <p style={{ fontWeight:700, fontSize:15 }}>₹ Salary Payments</p>
            <button onClick={()=>setShowPay(s=>!s)} style={{ color:'var(--blue)', fontWeight:700, fontSize:13, background:'var(--blue-lt)', padding:'5px 12px', borderRadius:50 }}>
              {showPay?'Cancel':'+ Add Payment'}
            </button>
          </div>
          {showPay && (
            <div style={{ marginTop:8 }}>
              <div className="field"><label>Amount (₹)</label><input type="number" placeholder="Enter amount" value={payForm.amount} onChange={e=>setPayForm(f=>({...f,amount:e.target.value}))} inputMode="decimal" autoFocus /></div>
              <div className="field">
                <label>Payment Type</label>
                <select value={payForm.type} onChange={e=>setPayForm(f=>({...f,type:e.target.value}))}>
                  <option value="salary">Salary</option>
                  <option value="advance">Advance</option>
                  <option value="bonus">Bonus</option>
                  <option value="deduction">Deduction</option>
                </select>
              </div>
              <div className="field"><label>Note</label><input placeholder="Optional note" value={payForm.description} onChange={e=>setPayForm(f=>({...f,description:e.target.value}))} /></div>
              <button className="btn btn-green btn-full" onClick={addPayment} disabled={payLoading}>{payLoading?'Saving…':'Save Payment'}</button>
            </div>
          )}
          {!showPay && staff.paymentHistory?.length > 0 && (
            <div>
              {staff.paymentHistory.slice(-5).reverse().map((p,i)=>(
                <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'7px 0', borderBottom:'1px solid var(--border)' }}>
                  <div>
                    <p style={{ fontSize:13, fontWeight:600, textTransform:'capitalize' }}>{p.type}</p>
                    {p.description && <p style={{ fontSize:11, color:'var(--text3)' }}>{p.description}</p>}
                    <p style={{ fontSize:11, color:'var(--text4)' }}>{fmtDate(p.date)}</p>
                  </div>
                  <p className={p.type==='deduction'?'neg':'pos'} style={{ fontSize:14 }}>₹{fmt(p.amount,2)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Permissions */}
        <div className="card card-p" style={{ marginBottom:14 }}>
          <p style={{ fontWeight:700, fontSize:15, marginBottom:12 }}>🔐 Permissions</p>
          {[['viewReports','View Reports'],['addTransactions','Add Transactions'],['manageParties','Manage Parties']].map(([k,v])=>(
            <div key={k} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom:'1px solid var(--border)' }}>
              <span style={{ fontSize:14, color:'var(--text2)' }}>{v}</span>
              <button
                onClick={async()=>{
                  try {
                    const perms = { ...staff.permissions, [k]: !staff.permissions?.[k] };
                    const r = await axios.put(`/api/staff/${id}`, { permissions: perms });
                    setStaff(r.data.data);
                    toast.success(`Permission ${perms[k]?'granted':'revoked'}`);
                  } catch { toast.error('Failed'); }
                }}
                style={{ width:44, height:24, borderRadius:50, background: staff.permissions?.[k]?'var(--green)':'var(--border)', transition:'background .2s', display:'flex', alignItems:'center', padding:'2px', border:'none', cursor:'pointer' }}>
                <span style={{ width:20, height:20, borderRadius:'50%', background:'white', display:'block', marginLeft: staff.permissions?.[k]?'auto':'0', transition:'margin .2s', boxShadow:'0 1px 4px rgba(0,0,0,.2)' }}/>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Day attendance modal */}
      {selDay && (
        <div className="overlay" onClick={()=>setSelDay(null)}>
          <div className="sheet" onClick={e=>e.stopPropagation()}>
            <h3 style={{ fontWeight:800, marginBottom:4 }}>{selDay.toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long'})}</h3>
            <p style={{ color:'var(--text3)', fontSize:13, marginBottom:16 }}>Mark attendance for {staff.name}</p>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              {Object.entries(ATT_LABEL).map(([k,v])=>(
                <button key={k} onClick={()=>markDay(selDay,k)} style={{ padding:14, borderRadius:12, fontWeight:700, fontSize:14, cursor:'pointer', background:ATT_BG[k], border:`2px solid ${ATT_BORDER[k]}`, color:ATT_COLOR[k], fontFamily:'inherit' }}>{v}</button>
              ))}
            </div>
            <button onClick={()=>setSelDay(null)} style={{ width:'100%', marginTop:14, padding:14, borderRadius:12, background:'var(--bg)', border:'none', fontWeight:700, fontSize:14, color:'var(--text2)', cursor:'pointer', fontFamily:'inherit' }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
