import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { fmt, avatarColor, avatarLetter, ATT_LABEL, ATT_BG, ATT_BORDER, ATT_COLOR, ATT_DOT } from '../../utils/helpers';

function AttDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const current = value || null;

  return (
    <div className="dropdown-wrap" ref={ref}>
      <button
        className="dropdown-trigger"
        style={{
          background: current ? ATT_BG[current] : 'var(--bg)',
          borderColor: current ? ATT_BORDER[current] : 'var(--border)',
          color: current ? ATT_COLOR[current] : 'var(--text3)',
        }}
        onClick={() => setOpen(o => !o)}
      >
        <span style={{ display:'flex', alignItems:'center', gap:7 }}>
          <span style={{ width:14, height:14, borderRadius:'50%', background: current ? ATT_DOT[current] : 'var(--border)', display:'inline-block', flexShrink:0, border: current?'none':'2px solid var(--border)' }} />
          {current ? ATT_LABEL[current] : 'Mark'}
        </span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ transform: open?'rotate(180deg)':'none', transition:'transform .2s' }}>
          <path d="m6 9 6 6 6-6"/>
        </svg>
      </button>

      {open && (
        <div className="dropdown-menu">
          {Object.entries(ATT_LABEL).map(([k, v]) => (
            <div key={k} className="dropdown-opt" onClick={() => { onChange(k); setOpen(false); }}>
              <div className="dot" style={{ borderColor: ATT_BORDER[k], background: ATT_BG[k] }}>
                <span style={{ width:8, height:8, borderRadius:'50%', background: ATT_DOT[k], display:'block' }} />
              </div>
              <span style={{ color: k === value ? ATT_COLOR[k] : 'var(--text)', fontWeight: k===value?700:600 }}>{v}</span>
              {k === value && <span style={{ marginLeft:'auto', color: ATT_COLOR[k] }}>✓</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function StaffList() {
  const navigate = useNavigate();
  const [staff,    setStaff]    = useState([]);
  const [summary,  setSummary]  = useState({});
  const [todaySum, setTodaySum] = useState({});
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState('all'); // all | salary | permission

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [sR, sumR, todR] = await Promise.all([
        axios.get('/api/staff'),
        axios.get('/api/staff/summary/due'),
        axios.get('/api/attendance/summary/today'),
      ]);
      setStaff(sR.data.data);
      setSummary(sumR.data.data);
      setTodaySum(todR.data.data.summary || {});
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const markAtt = async (staffId, status) => {
    try {
      await axios.post('/api/attendance', { staffId, date: new Date().toISOString(), status });
      toast.success(`✅ ${ATT_LABEL[status]}`);
      load();
    } catch(e) { toast.error(e.response?.data?.message || 'Failed to mark'); }
  };

  const today = new Date().toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' });

  const filtered = staff.filter(s => {
    if (filter === 'salary')     return s.salary > 0;
    if (filter === 'permission') return s.permissions?.viewReports || s.permissions?.addTransactions || s.permissions?.manageParties;
    return true;
  });

  return (
    <div style={{ background:'var(--bg)', minHeight:'100vh', paddingBottom:90 }}>
      {/* Header */}
      <div className="grad-blue" style={{ padding:'18px 16px 20px', color:'white' }}>
        <h2 style={{ fontSize:20, fontWeight:800, marginBottom:14 }}>👷 Manage Staff</h2>

        {/* Summary card */}
        <div style={{ background:'rgba(255,255,255,.13)', borderRadius:14, padding:'14px 16px', display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
          <div>
            <p style={{ opacity:.7, fontSize:11, marginBottom:4 }}>Total Due</p>
            <p style={{ fontSize:26, fontWeight:800 }}>₹{fmt(summary.totalDue||0,2)}</p>
            <p style={{ opacity:.6, fontSize:11, marginTop:2 }}>for {summary.staffCount||0} staff</p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'6px 14px', fontSize:12 }}>
            <span style={{ display:'flex', alignItems:'center', gap:5 }}>
              <span style={{ width:10, height:10, borderRadius:'50%', background:'#1a9e5c', display:'inline-block' }}/> P {todaySum.present||0}
            </span>
            <span style={{ display:'flex', alignItems:'center', gap:5 }}>
              <span style={{ width:10, height:10, borderRadius:'50%', background:'#e53935', display:'inline-block' }}/> A {todaySum.absent||0}
            </span>
            <span style={{ display:'flex', alignItems:'center', gap:5 }}>
              <span style={{ width:10, height:10, borderRadius:'50%', background:'#f57c00', display:'inline-block' }}/> H {todaySum.half_day||0}
            </span>
            <span style={{ display:'flex', alignItems:'center', gap:5 }}>
              <span style={{ width:10, height:10, borderRadius:'50%', background:'#6677cc', display:'inline-block' }}/> PL {todaySum.paid_leave||0}
            </span>
          </div>
        </div>
        <p style={{ opacity:.6, fontSize:11 }}>Attendance — {today}</p>
      </div>

      <div style={{ padding:'14px 14px 0' }}>
        {/* Filter tabs */}
        <div className="tabs" style={{ marginBottom:14 }}>
          {[['all','All'],['salary','Salary & Attendance Added'],['permission','Permission Given']].map(([k,v])=>(
            <button key={k} className={`tab-pill${filter===k?' active':''}`} onClick={()=>setFilter(k)}>{v}</button>
          ))}
        </div>

        {loading ? <div className="spinner"><div className="spin"/></div>
        : filtered.length === 0 ? (
          <div className="empty">
            <div className="ico">👷</div>
            <h3>No staff added yet</h3>
            <p>Tap ADD STAFF to add your first employee</p>
          </div>
        ) : filtered.map(s => (
          <div key={s._id} className="card card-p" style={{ marginBottom:12 }}>
            {/* Staff header row */}
            <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
              <div className="avatar" style={{ background:avatarColor(s.name) }}>{avatarLetter(s.name)}</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <h3 style={{ fontSize:15, fontWeight:700 }}>{s.name}</h3>
                  <span className="badge badge-blue" style={{ fontSize:10 }}>{s.salaryType}</span>
                </div>
                <p style={{ fontSize:12, color:'var(--text3)' }}>₹{fmt(s.salary,0)}/month{s.role?` · ${s.role}`:''}</p>
              </div>
              <div style={{ textAlign:'right' }}>
                <p className="get" style={{ fontSize:15 }}>₹{fmt(summary.details?.find(d=>d._id===s._id)?.due||0, 2)}</p>
                <button onClick={()=>navigate(`/staff/${s._id}`)} style={{ fontSize:11, color:'var(--blue)', fontWeight:700, marginTop:4, padding:'4px 10px', background:'var(--blue-lt)', borderRadius:8 }}>View →</button>
              </div>
            </div>

            {/* Permissions + Attendance row */}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div>
                <p style={{ fontSize:10, color:'var(--text3)', fontWeight:700, textTransform:'uppercase', marginBottom:5 }}>Permissions</p>
                <button onClick={()=>navigate(`/staff/${s._id}`)} style={{ fontSize:12, color:'var(--blue)', fontWeight:700, background:'var(--blue-lt)', border:'1px solid var(--blue-md)', borderRadius:50, padding:'5px 12px' }}>+Add Permission</button>
              </div>
              <div>
                <p style={{ fontSize:10, color:'var(--text3)', fontWeight:700, textTransform:'uppercase', marginBottom:5, textAlign:'right' }}>Today's Attendance</p>
                <AttDropdown value={s.todayAttendance} onChange={status => markAtt(s._id, status)} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <button className="fab fab-pink" onClick={()=>navigate('/staff/add')}>
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2.5" strokeLinecap="round"/></svg>
        ADD STAFF
      </button>
    </div>
  );
}
