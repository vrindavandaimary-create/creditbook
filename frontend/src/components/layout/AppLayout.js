import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

const NAV = [
  { path:'/', label:'Home', icon:(a)=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={a?2.5:2} strokeLinecap="round"><path d="M3 12L12 3l9 9"/><path d="M5 10v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-9"/></svg> },
  { path:'/customers', label:'Customers', icon:(a)=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={a?2.5:2} strokeLinecap="round"><circle cx="9" cy="7" r="4"/><path d="M2 21v-2a7 7 0 0114 0v2"/><path d="M19 8v6M16 11h6"/></svg> },
  { path:'/suppliers', label:'Suppliers', icon:(a)=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={a?2.5:2} strokeLinecap="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/><path d="M12 12v4M10 14h4"/></svg> },
  { path:'/staff', label:'Staff', icon:(a)=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={a?2.5:2} strokeLinecap="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M8 4v16M3 9h5M3 14h5M13 9h8M13 14h8"/></svg> },
  { path:'/calculator', label:'Calc', icon:(a)=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={a?2.5:2} strokeLinecap="round"><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M8 6h8M8 10h2M12 10h2M16 10h0M8 14h2M12 14h2M16 14h0M8 18h2M12 18h2M16 18h0"/></svg> },
  { path:'/profile', label:'More', icon:(a)=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={a?2.5:2} strokeLinecap="round"><circle cx="12" cy="5" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="12" cy="19" r="1" fill="currentColor"/></svg> },
];

export default function AppLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isActive = (p) => p==='/' ? pathname==='/' : pathname.startsWith(p);
  return (
    <div style={{ maxWidth:'var(--maxw)', margin:'0 auto', minHeight:'100vh', background:'var(--bg)', position:'relative' }}>
      <Outlet />
      <nav className="bottom-nav">
        {NAV.map(item => {
          const active = isActive(item.path);
          return (
            <button key={item.path} className={`nav-item${active?' active':''}`} onClick={() => navigate(item.path)}>
              {item.icon(active)}
              {item.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
