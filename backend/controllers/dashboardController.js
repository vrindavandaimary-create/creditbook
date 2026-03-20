const Party = require('../models/Party');
const Transaction = require('../models/Transaction');
const Staff = require('../models/Staff');
const Attendance = require('../models/Attendance');

const getDashboard = async (req, res) => {
  try {
    const uid = req.user._id;
    const todayStart = new Date(); todayStart.setHours(0,0,0,0);
    const todayEnd   = new Date(); todayEnd.setHours(23,59,59,999);
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

    const [parties, todayTx, monthTx, staff, todayAtt] = await Promise.all([
      Party.find({ userId: uid, isActive: true }).lean(),
      Transaction.find({ userId: uid, date: { $gte: todayStart, $lte: todayEnd } }).lean(),
      Transaction.find({ userId: uid, date: { $gte: monthStart, $lte: todayEnd } }).lean(),
      Staff.find({ userId: uid, isActive: true }).lean(),
      Attendance.find({ userId: uid, date: { $gte: todayStart, $lt: new Date(todayStart.getTime()+86400000) } }).lean()
    ]);

    const customers = parties.filter(p => p.type === 'customer');
    const suppliers = parties.filter(p => p.type === 'supplier');
    const customerToGet  = customers.filter(p => p.balance > 0).reduce((s,p) => s+p.balance, 0);
    const customerToGive = customers.filter(p => p.balance < 0).reduce((s,p) => s+Math.abs(p.balance), 0);
    const supplierToGive = suppliers.filter(p => p.balance < 0).reduce((s,p) => s+Math.abs(p.balance), 0);
    const supplierToGet  = suppliers.filter(p => p.balance > 0).reduce((s,p) => s+p.balance, 0);

    const todayIn  = todayTx.filter(t => t.type==='got').reduce((s,t) => s+t.amount, 0);
    const todayOut = todayTx.filter(t => t.type==='gave').reduce((s,t) => s+t.amount, 0);
    const monthIn  = monthTx.filter(t => t.type==='got').reduce((s,t) => s+t.amount, 0);
    const monthOut = monthTx.filter(t => t.type==='gave').reduce((s,t) => s+t.amount, 0);

    const attSummary = { present:0, absent:0, half_day:0, paid_leave:0 };
    todayAtt.forEach(a => { if (attSummary[a.status]!==undefined) attSummary[a.status]++; });

    const recentTx = await Transaction.find({ userId: uid }).populate('partyId','name type').sort({ date: -1 }).limit(10).lean();
    const topCustomers = customers.filter(p => p.balance > 0).sort((a,b) => b.balance-a.balance).slice(0,5);

    res.json({
      success: true,
      data: {
        customers: { count: customers.length, toGet: +customerToGet.toFixed(2), toGive: +customerToGive.toFixed(2) },
        suppliers: { count: suppliers.length, toGive: +supplierToGive.toFixed(2), toGet: +supplierToGet.toFixed(2) },
        today:    { in: +todayIn.toFixed(2), out: +todayOut.toFixed(2), net: +(todayIn-todayOut).toFixed(2), txCount: todayTx.length },
        thisMonth:{ in: +monthIn.toFixed(2), out: +monthOut.toFixed(2), net: +(monthIn-monthOut).toFixed(2) },
        staff:    { count: staff.length, attendance: attSummary },
        recentTransactions: recentTx,
        topCustomers,
        netPosition: +(customerToGet-customerToGive-supplierToGive+supplierToGet).toFixed(2)
      }
    });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

const getCashflow = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const from = new Date(); from.setDate(from.getDate()-days); from.setHours(0,0,0,0);
    const txs = await Transaction.find({ userId: req.user._id, date: { $gte: from } }).lean();
    const map = {};
    for (let i = days; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate()-i); d.setHours(0,0,0,0);
      const k = d.toISOString().split('T')[0];
      map[k] = { date: k, in: 0, out: 0 };
    }
    txs.forEach(t => {
      const k = new Date(t.date).toISOString().split('T')[0];
      if (map[k]) { if (t.type==='got') map[k].in+=t.amount; else map[k].out+=t.amount; }
    });
    res.json({ success: true, data: Object.values(map) });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

module.exports = { getDashboard, getCashflow };
