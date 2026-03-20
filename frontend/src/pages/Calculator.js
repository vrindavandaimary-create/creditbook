import React, { useState, useCallback } from 'react';

const BUTTONS = [
  ['C', '±', '%', '÷'],
  ['7', '8', '9', '×'],
  ['4', '5', '6', '−'],
  ['1', '2', '3', '+'],
  ['0', '.', '⌫', '='],
];


export default function Calculator() {
  const [display, setDisplay]   = useState('0');
  const [expr,    setExpr]      = useState('');
  const [prevVal, setPrevVal]   = useState(null);
  const [op,      setOp]        = useState(null);
  const [newNum,  setNewNum]    = useState(true);
  const [history, setHistory]   = useState([]);

  const fmt = (n) => {
    const num = parseFloat(n);
    if (isNaN(num)) return 'Error';
    if (Math.abs(num) >= 1e12) return 'Overflow';
    const str = parseFloat(num.toFixed(10)).toString();
    const [int, dec] = str.split('.');
    const intFmt = Number(int).toLocaleString('en-IN');
    return dec ? `${intFmt}.${dec}` : intFmt;
  };

  const press = useCallback((btn) => {
    if (btn === 'C') {
      setDisplay('0'); setExpr(''); setPrevVal(null); setOp(null); setNewNum(true);
      return;
    }
    if (btn === '⌫') {
      if (display.length > 1) setDisplay(d => d.slice(0,-1));
      else setDisplay('0');
      return;
    }
    if (btn === '±') {
      setDisplay(d => d.startsWith('-') ? d.slice(1) : '-'+d);
      return;
    }
    if (btn === '%') {
      const n = parseFloat(display);
      if (!isNaN(n)) setDisplay(String(n / 100));
      return;
    }
    if (['÷','×','−','+'].includes(btn)) {
      const cur = parseFloat(display);
      if (op && !newNum) {
        // chain operation
        const res = calc(prevVal, cur, op);
        setDisplay(String(res));
        setPrevVal(res);
      } else {
        setPrevVal(cur);
      }
      setOp(btn);
      setExpr(`${fmt(display)} ${btn}`);
      setNewNum(true);
      return;
    }
    if (btn === '=') {
      if (op === null || prevVal === null) return;
      const cur = parseFloat(display);
      const res = calc(prevVal, cur, op);
      const entry = `${fmt(prevVal)} ${op} ${fmt(cur)} = ${fmt(res)}`;
      setHistory(h => [entry, ...h].slice(0,10));
      setExpr(entry);
      setDisplay(String(res));
      setPrevVal(null); setOp(null); setNewNum(true);
      return;
    }
    // digit or dot
    if (newNum) {
      setDisplay(btn === '.' ? '0.' : btn);
      setNewNum(false);
    } else {
      if (btn === '.' && display.includes('.')) return;
      if (display === '0' && btn !== '.') setDisplay(btn);
      else setDisplay(d => d.length >= 15 ? d : d + btn);
    }
  }, [display, prevVal, op, newNum]);

  const calc = (a, b, operator) => {
    const fa = parseFloat(a), fb = parseFloat(b);
    switch(operator) {
      case '+': return parseFloat((fa + fb).toFixed(10));
      case '−': return parseFloat((fa - fb).toFixed(10));
      case '×': return parseFloat((fa * fb).toFixed(10));
      case '÷': return fb === 0 ? 'Error' : parseFloat((fa / fb).toFixed(10));
      default:  return b;
    }
  };

  const getBtnClass = (btn) => {
    if (btn === '=')              return 'calc-btn equals';
    if (btn === 'C')              return 'calc-btn clear';
    if (btn === '⌫')              return 'calc-btn del';
    if (['÷','×','−','+'].includes(btn)) return 'calc-btn op';
    if (['±','%'].includes(btn)) return 'calc-btn action';
    return 'calc-btn';
  };


  // Build flat grid with span for 0
  const flatBtns = [];
  BUTTONS.forEach(row => row.forEach(btn => flatBtns.push(btn)));

  return (
    <div style={{ background:'var(--bg)', minHeight:'100vh', paddingBottom:80, display:'flex', flexDirection:'column' }}>
      {/* Header */}
      <div className="grad-blue" style={{ padding:'18px 16px 16px', color:'white' }}>
        <h2 style={{ fontSize:20, fontWeight:800, margin:0 }}>🧮 Calculator</h2>
        <p style={{ opacity:.7, fontSize:12, marginTop:4 }}>Business-ready calculator</p>
      </div>

      {/* Display */}
      <div className="calc-display">
        <div className="calc-expr">{expr || ' '}</div>
        <div className="calc-result">{fmt(display)}</div>
      </div>

      {/* History */}
      {history.length > 0 && (
        <div style={{ padding:'8px 14px', background:'white', borderBottom:'1px solid var(--border)', maxHeight:80, overflowY:'auto' }}>
          {history.slice(0,3).map((h,i)=>(
            <p key={i} style={{ fontSize:11, color:'var(--text3)', padding:'2px 0', fontFamily:'monospace' }}>{h}</p>
          ))}
        </div>
      )}

      {/* Buttons */}
      <div style={{ flex:1 }}>
        <div className="calc-grid">
          {BUTTONS.map((row, ri) =>
            row.map((btn, ci) => {
              if (btn === '0') return (
                <button key={btn} className={getBtnClass(btn)}
                  style={{ gridColumn:'span 2' }}
                  onClick={()=>press(btn)}>{btn}</button>
              );
              return (
                <button key={`${ri}-${ci}`} className={getBtnClass(btn)}
                  onClick={()=>press(btn)}>{btn}</button>
              );
            })
          )}
        </div>
      </div>

      {/* Quick tools */}
      <div style={{ padding:'12px 14px 8px', background:'white', borderTop:'1px solid var(--border)' }}>
        <p style={{ fontSize:11, fontWeight:700, color:'var(--text3)', textTransform:'uppercase', letterSpacing:.5, marginBottom:8 }}>Quick Actions</p>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          {[
            { label:'GST 18%', action:()=>{ const n=parseFloat(display); if(!isNaN(n)){ const gst=n*0.18; setExpr(`GST 18% on ₹${fmt(n)} = ₹${fmt(gst)}`); setDisplay(String(parseFloat((n+gst).toFixed(2)))); setNewNum(true); }}},
            { label:'GST 12%', action:()=>{ const n=parseFloat(display); if(!isNaN(n)){ const gst=n*0.12; setExpr(`GST 12% on ₹${fmt(n)} = ₹${fmt(gst)}`); setDisplay(String(parseFloat((n+gst).toFixed(2)))); setNewNum(true); }}},
            { label:'GST 5%',  action:()=>{ const n=parseFloat(display); if(!isNaN(n)){ const gst=n*0.05; setExpr(`GST 5% on ₹${fmt(n)} = ₹${fmt(gst)}`); setDisplay(String(parseFloat((n+gst).toFixed(2)))); setNewNum(true); }}},
            { label:'Discount 10%', action:()=>{ const n=parseFloat(display); if(!isNaN(n)){ const d=n*0.10; setExpr(`10% off ₹${fmt(n)} = ₹${fmt(d)} off`); setDisplay(String(parseFloat((n-d).toFixed(2)))); setNewNum(true); }}},
            { label:'Discount 20%', action:()=>{ const n=parseFloat(display); if(!isNaN(n)){ const d=n*0.20; setExpr(`20% off ₹${fmt(n)} = ₹${fmt(d)} off`); setDisplay(String(parseFloat((n-d).toFixed(2)))); setNewNum(true); }}},
          ].map(({ label, action })=>(
            <button key={label} onClick={action}
              style={{ padding:'7px 12px', background:'var(--blue-lt)', color:'var(--blue)', borderRadius:50, fontSize:12, fontWeight:700, border:'1px solid var(--blue-md)', cursor:'pointer', fontFamily:'inherit' }}>
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
