const COLORS = ['#1a4fd6','#e53935','#1a9e5c','#f57c00','#7b1fa2','#0097a7','#c62828','#283593','#558b2f','#ad1457'];
export const avatarColor  = (name='') => COLORS[name.charCodeAt(0) % COLORS.length];
export const avatarLetter = (name='') => (name[0]||'?').toUpperCase();
export const fmt = (n=0, d=2) => Number(n).toLocaleString('en-IN',{minimumFractionDigits:d,maximumFractionDigits:d});
export const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}) : '';
export const fmtDateTime = (d) => d ? new Date(d).toLocaleString('en-IN',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}) : '';
export const todayStr = () => new Date().toISOString().split('T')[0];
export const ATT_LABEL  = { present:'Present', absent:'Absent', half_day:'Half Day', paid_leave:'Paid Leave' };
export const ATT_BG     = { present:'#d4f5e5', absent:'#ffe0e0', half_day:'#fff3e0', paid_leave:'#eef0ff' };
export const ATT_BORDER = { present:'#1a9e5c', absent:'#e53935', half_day:'#f57c00', paid_leave:'#6677cc' };
export const ATT_COLOR  = { present:'#166040', absent:'#b71c1c', half_day:'#e65100', paid_leave:'#4455aa' };
export const ATT_DOT    = { present:'#1a9e5c', absent:'#e53935', half_day:'#f57c00', paid_leave:'#6677cc' };
export const getCalDays = (year, month) => {
  const start = new Date(year, month, 1);
  const end   = new Date(year, month+1, 0);
  const pad   = (start.getDay()+6)%7;
  const cells = Array(pad).fill(null);
  for (let d=1; d<=end.getDate(); d++) cells.push(new Date(year,month,d));
  while (cells.length%7!==0) cells.push(null);
  return cells;
};
export const isSameDay = (a,b) => {
  if (!a||!b) return false;
  const da=new Date(a), db=new Date(b);
  return da.getFullYear()===db.getFullYear()&&da.getMonth()===db.getMonth()&&da.getDate()===db.getDate();
};
export const isToday = (d) => isSameDay(d, new Date());
