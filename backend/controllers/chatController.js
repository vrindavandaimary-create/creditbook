const Party = require('../models/Party');
const Transaction = require('../models/Transaction');
const Staff = require('../models/Staff');
const Attendance = require('../models/Attendance');
const fetch = require('node-fetch');

const chat = async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    if (!message?.trim()) return res.status(400).json({ success: false, message: 'Message required.' });

    const uid = req.user._id;
    const [parties, staff, recentTx] = await Promise.all([
      Party.find({ userId: uid, isActive: true }).lean(),
      Staff.find({ userId: uid, isActive: true }).lean(),
      Transaction.find({ userId: uid }).populate('partyId','name type').sort({ date: -1 }).limit(15).lean()
    ]);

    const customers = parties.filter(p => p.type === 'customer');
    const suppliers = parties.filter(p => p.type === 'supplier');
    const customerToGet  = customers.filter(p => p.balance > 0).reduce((s,p) => s+p.balance, 0);
    const customerToGive = customers.filter(p => p.balance < 0).reduce((s,p) => s+Math.abs(p.balance), 0);
    const supplierToGive = suppliers.filter(p => p.balance < 0).reduce((s,p) => s+Math.abs(p.balance), 0);
    const supplierToGet  = suppliers.filter(p => p.balance > 0).reduce((s,p) => s+p.balance, 0);

    const today = new Date(); today.setHours(0,0,0,0);
    const todayAtt = await Attendance.find({ userId: uid, date: { $gte: today, $lt: new Date(today.getTime()+86400000) } }).lean();
    const attSummary = { present:0, absent:0, half_day:0, paid_leave:0 };
    todayAtt.forEach(a => { if (attSummary[a.status]!==undefined) attSummary[a.status]++; });

    const systemPrompt = `You are CreditBot, an AI assistant for CreditBook — a business accounting app.
Today: ${new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}
Owner: ${req.user.name} | Business: ${req.user.businessName}
Customers(${customers.length}): GET ₹${customerToGet.toFixed(2)} | GIVE ₹${customerToGive.toFixed(2)}
Suppliers(${suppliers.length}): GIVE ₹${supplierToGive.toFixed(2)} | GET ₹${supplierToGet.toFixed(2)}
Staff(${staff.length}): ${staff.map(s=>`${s.name}(₹${s.salary}/mo)`).join(', ')||'none'}
Attendance: P=${attSummary.present} A=${attSummary.absent} H=${attSummary.half_day} PL=${attSummary.paid_leave}
Net: ₹${(customerToGet-customerToGive-supplierToGive+supplierToGet).toFixed(2)}
Be concise, use ₹, max 150 words.`;

    const GROQ_API_KEY = process.env.GROQ_API_KEY || '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';

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_API_KEY}` },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 300,
        temperature: 0.7,
        messages: [
          { role: 'system', content: systemPrompt },
          ...history.slice(-6).map(m => ({ role: m.role, content: m.content })),
          { role: 'user', content: message }
        ]
      })
    });

    if (!response.ok) throw new Error('Groq API error');
    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || 'Sorry, could not get a response.';
    res.json({ success: true, data: { reply } });
  } catch (e) {
    res.json({ success: true, data: { reply: '🤖 AI is temporarily unavailable. Please try again.' } });
  }
};

module.exports = { chat };
