import React, { useState, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';

export default function ChatBot() {
  const [open,    setOpen]    = useState(false);
  const [msgs,    setMsgs]    = useState([
    { role:'assistant', content:'👋 Hello! I\'m CreditBot, your AI business assistant powered by Groq (Llama 3.3).\n\nAsk me anything about your business — balances, customer dues, staff, or how to use the app!', ts: new Date() }
  ]);
  const [input,   setInput]   = useState('');
  const [loading, setLoading] = useState(false);
  const [unread,  setUnread]  = useState(0);
  const bottomRef = useRef();
  const inputRef  = useRef();

  useEffect(() => {
    if (open) { setUnread(0); setTimeout(()=>bottomRef.current?.scrollIntoView({behavior:'smooth'}),100); }
  }, [open, msgs]);

  const send = useCallback(async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput('');
    const userMsg = { role:'user', content:msg, ts:new Date() };
    setMsgs(prev=>[...prev, userMsg]);
    setLoading(true);
    try {
      const history = msgs.slice(-8).map(m=>({ role:m.role, content:m.content }));
      const r = await axios.post('/api/chat', { message:msg, history });
      const botMsg = { role:'assistant', content:r.data.data.reply, ts:new Date() };
      setMsgs(prev=>[...prev, botMsg]);
      if (!open) setUnread(u=>u+1);
    } catch {
      setMsgs(prev=>[...prev,{ role:'assistant', content:'❌ Could not connect to AI. Please check your server is running.', ts:new Date() }]);
    } finally { setLoading(false); }
  }, [input, loading, msgs, open]);

  const SUGGESTIONS = ['What\'s my total balance?', 'Who owes me money?', 'Staff attendance today', 'Supplier dues', 'Net position'];

  const fmtTime = (d) => new Date(d).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'});

  return (
    <>
      {/* Chat panel */}
      {open && (
        <div style={{
          position:'fixed', bottom:72, right:12, width:330, height:480, maxHeight:'68vh',
          background:'white', borderRadius:20, boxShadow:'0 8px 40px rgba(26,79,214,.22)',
          display:'flex', flexDirection:'column', zIndex:400,
          border:'1.5px solid var(--border)', overflow:'hidden',
          left: window.innerWidth<=480 ? '50%' : 'auto',
          transform: window.innerWidth<=480 ? 'translateX(-50%)' : 'none',
          maxWidth:'calc(100vw - 28px)',
        }}>
          {/* Header */}
          <div className="grad-blue" style={{ padding:'12px 14px', display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
            <div style={{ width:34, height:34, borderRadius:'50%', background:'rgba(255,255,255,.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>🤖</div>
            <div style={{ flex:1 }}>
              <p style={{ fontWeight:800, fontSize:14, color:'white', margin:0 }}>CreditBot</p>
              <p style={{ fontSize:10, color:'rgba(255,255,255,.7)', margin:0 }}>Powered by Groq · Llama 3.3</p>
            </div>
            <button onClick={()=>setOpen(false)} style={{ background:'rgba(255,255,255,.2)', border:'none', color:'white', width:26, height:26, borderRadius:'50%', cursor:'pointer', fontSize:14, display:'flex', alignItems:'center', justifyContent:'center' }}>×</button>
          </div>

          {/* Messages */}
          <div style={{ flex:1, overflowY:'auto', padding:'10px 12px', display:'flex', flexDirection:'column', gap:8 }}>
            {msgs.map((m,i)=>(
              <div key={i} style={{ display:'flex', flexDirection:'column', alignItems: m.role==='user'?'flex-end':'flex-start' }}>
                <div style={{
                  maxWidth:'88%', padding:'9px 13px',
                  borderRadius: m.role==='user'?'16px 16px 4px 16px':'16px 16px 16px 4px',
                  background: m.role==='user'?'var(--blue)':'var(--bg)',
                  color: m.role==='user'?'white':'var(--text)',
                  fontSize:13, lineHeight:1.55, whiteSpace:'pre-wrap', wordBreak:'break-word',
                }}>
                  {m.content}
                </div>
                <p style={{ fontSize:10, color:'var(--text4)', marginTop:3 }}>{fmtTime(m.ts)}</p>
              </div>
            ))}
            {loading && (
              <div style={{ display:'flex', alignItems:'flex-start' }}>
                <div style={{ background:'var(--bg)', borderRadius:'16px 16px 16px 4px', padding:'12px 16px', display:'flex', gap:5, alignItems:'center' }}>
                  {[0,1,2].map(i=>(
                    <div key={i} style={{ width:7, height:7, borderRadius:'50%', background:'var(--blue)', animation:'dotBounce 1s infinite', animationDelay:`${i*.2}s` }}/>
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef}/>
          </div>

          {/* Suggestions (show when few messages) */}
          {msgs.length <= 2 && (
            <div style={{ padding:'0 10px 6px', display:'flex', gap:5, flexWrap:'wrap', flexShrink:0 }}>
              {SUGGESTIONS.map((s,i)=>(
                <button key={i} onClick={()=>send(s)} style={{ background:'var(--blue-lt)', border:'1.5px solid var(--blue-md)', borderRadius:50, padding:'5px 10px', fontSize:11, fontWeight:600, color:'var(--blue)', cursor:'pointer', fontFamily:'inherit' }}>{s}</button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{ padding:'8px 10px 10px', display:'flex', gap:7, borderTop:'1px solid var(--border)', flexShrink:0 }}>
            <input
              ref={inputRef}
              value={input}
              onChange={e=>setInput(e.target.value)}
              onKeyDown={e=>{ if(e.key==='Enter'&&!e.shiftKey){ e.preventDefault(); send(); }}}
              placeholder="Ask about your business…"
              style={{ flex:1, border:'1.5px solid var(--border)', borderRadius:50, padding:'9px 14px', fontSize:13, background:'var(--bg)', fontFamily:'inherit' }}
            />
            <button
              onClick={()=>send()}
              disabled={loading || !input.trim()}
              style={{ width:38, height:38, borderRadius:'50%', background: input.trim()?'var(--blue)':'var(--border)', border:'none', color:'white', cursor: input.trim()?'pointer':'default', fontSize:15, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              ➤
            </button>
          </div>
        </div>
      )}

      {/* FAB button */}
      <button
        onClick={()=>setOpen(o=>!o)}
        style={{
          position:'fixed', bottom:74, right:12, width:50, height:50, borderRadius:'50%',
          background:'linear-gradient(135deg,#1a4fd6,#0e2a8a)', border:'none', color:'white',
          fontSize:22, cursor:'pointer', boxShadow:'0 4px 20px rgba(26,79,214,.4)',
          zIndex:399, display:'flex', alignItems:'center', justifyContent:'center',
          transition:'transform .2s', transform: open?'scale(.9)':'scale(1)',
        }}>
        {open ? '✕' : '🤖'}
        {!open && unread > 0 && (
          <span style={{ position:'absolute', top:-4, right:-4, background:'var(--red)', color:'white', borderRadius:'50%', width:18, height:18, fontSize:10, fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center' }}>{unread}</span>
        )}
      </button>
    </>
  );
}
