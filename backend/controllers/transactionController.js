const Transaction = require('../models/Transaction');
const Party = require('../models/Party');

const addTransaction = async (req, res) => {
  try {
    const { partyId, type, amount, description, date } = req.body;
    if (!partyId || !type || !amount) return res.status(400).json({ success: false, message: 'partyId, type, amount required.' });
    if (!['gave','got'].includes(type)) return res.status(400).json({ success: false, message: 'type must be gave or got.' });
    if (Number(amount) <= 0) return res.status(400).json({ success: false, message: 'Amount must be > 0.' });
    const party = await Party.findOne({ _id: partyId, userId: req.user._id });
    if (!party) return res.status(404).json({ success: false, message: 'Party not found.' });
    let delta = 0;
    if (party.type === 'customer') delta = type === 'gave' ? +Number(amount) : -Number(amount);
    else delta = type === 'gave' ? -Number(amount) : +Number(amount);
    party.balance += delta;
    await party.save();
    const tx = await Transaction.create({ userId: req.user._id, partyId, type, amount: Number(amount), description: description?.trim() || '', date: date ? new Date(date) : new Date(), balanceAfter: party.balance });
    res.status(201).json({ success: true, data: { transaction: tx, party } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

const getTransactions = async (req, res) => {
  try {
    const { partyId, startDate, endDate, type, limit = 100 } = req.query;
    const q = { userId: req.user._id };
    if (partyId) q.partyId = partyId;
    if (type) q.type = type;
    if (startDate || endDate) { q.date = {}; if (startDate) q.date.$gte = new Date(startDate); if (endDate) { const e = new Date(endDate); e.setHours(23,59,59,999); q.date.$lte = e; } }
    const data = await Transaction.find(q).populate('partyId','name type phone').sort({ date: -1 }).limit(Number(limit)).lean();
    res.json({ success: true, count: data.length, data });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

const deleteTransaction = async (req, res) => {
  try {
    const tx = await Transaction.findOne({ _id: req.params.id, userId: req.user._id });
    if (!tx) return res.status(404).json({ success: false, message: 'Transaction not found.' });
    const party = await Party.findById(tx.partyId);
    if (party) {
      let delta = 0;
      if (party.type === 'customer') delta = tx.type === 'gave' ? -tx.amount : +tx.amount;
      else delta = tx.type === 'gave' ? +tx.amount : -tx.amount;
      party.balance += delta;
      await party.save();
    }
    await Transaction.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Deleted.', data: { party } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

module.exports = { addTransaction, getTransactions, deleteTransaction };
