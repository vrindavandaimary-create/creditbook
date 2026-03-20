const Party = require('../models/Party');
const Transaction = require('../models/Transaction');

const getParties = async (req, res) => {
  try {
    const { type, search } = req.query;
    const q = { userId: req.user._id, isActive: true };
    if (type) q.type = type;
    if (search) q.name = { $regex: search, $options: 'i' };
    const data = await Party.find(q).sort({ updatedAt: -1 }).lean();
    res.json({ success: true, count: data.length, data });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

const getParty = async (req, res) => {
  try {
    const party = await Party.findOne({ _id: req.params.id, userId: req.user._id });
    if (!party) return res.status(404).json({ success: false, message: 'Party not found.' });
    const transactions = await Transaction.find({ partyId: req.params.id, userId: req.user._id }).sort({ date: -1 }).lean();
    res.json({ success: true, data: { party, transactions } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

const createParty = async (req, res) => {
  try {
    const { name, phone, email, address, type, notes } = req.body;
    if (!name?.trim() || !type) return res.status(400).json({ success: false, message: 'Name and type required.' });
    const data = await Party.create({ userId: req.user._id, name: name.trim(), phone: phone?.trim() || '', email: email?.trim() || '', address: address?.trim() || '', type, notes: notes?.trim() || '' });
    res.status(201).json({ success: true, data });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

const updateParty = async (req, res) => {
  try {
    const data = await Party.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, req.body, { new: true });
    if (!data) return res.status(404).json({ success: false, message: 'Party not found.' });
    res.json({ success: true, data });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

const deleteParty = async (req, res) => {
  try {
    await Party.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, { isActive: false });
    await Transaction.deleteMany({ partyId: req.params.id });
    res.json({ success: true, message: 'Deleted.' });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

const getSummaryTotals = async (req, res) => {
  try {
    const parties = await Party.find({ userId: req.user._id, isActive: true }).lean();
    const customers = parties.filter(p => p.type === 'customer');
    const suppliers = parties.filter(p => p.type === 'supplier');
    res.json({
      success: true,
      data: {
        customerToGet:  customers.filter(p => p.balance > 0).reduce((s, p) => s + p.balance, 0),
        customerToGive: customers.filter(p => p.balance < 0).reduce((s, p) => s + Math.abs(p.balance), 0),
        supplierToGive: suppliers.filter(p => p.balance < 0).reduce((s, p) => s + Math.abs(p.balance), 0),
        supplierToGet:  suppliers.filter(p => p.balance > 0).reduce((s, p) => s + p.balance, 0),
        customerCount: customers.length, supplierCount: suppliers.length
      }
    });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

module.exports = { getParties, getParty, createParty, updateParty, deleteParty, getSummaryTotals };
