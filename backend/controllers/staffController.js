const Staff = require('../models/Staff');
const Attendance = require('../models/Attendance');

const getStaff = async (req, res) => {
  try {
    const staff = await Staff.find({ userId: req.user._id, isActive: true }).sort('-createdAt').lean();
    const today = new Date(); today.setHours(0,0,0,0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate()+1);
    const todayAtt = await Attendance.find({ userId: req.user._id, date: { $gte: today, $lt: tomorrow } }).lean();
    const attMap = {};
    todayAtt.forEach(a => { attMap[a.staffId.toString()] = a.status; });
    const data = staff.map(s => ({ ...s, todayAttendance: attMap[s._id.toString()] || null }));
    res.json({ success: true, count: data.length, data });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

const getStaffById = async (req, res) => {
  try {
    const data = await Staff.findOne({ _id: req.params.id, userId: req.user._id });
    if (!data) return res.status(404).json({ success: false, message: 'Staff not found.' });
    res.json({ success: true, data });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

const createStaff = async (req, res) => {
  try {
    const { name, phone, role, salaryType, salary, joiningDate, notes } = req.body;
    if (!name?.trim()) return res.status(400).json({ success: false, message: 'Name is required.' });
    if (!salary || Number(salary) < 0) return res.status(400).json({ success: false, message: 'Valid salary is required.' });
    const data = await Staff.create({ userId: req.user._id, name: name.trim(), phone: phone?.trim() || '', role: role?.trim() || '', salaryType: salaryType || 'monthly', salary: Number(salary), joiningDate: joiningDate ? new Date(joiningDate) : new Date(), notes: notes?.trim() || '' });
    res.status(201).json({ success: true, message: 'Staff added.', data });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

const updateStaff = async (req, res) => {
  try {
    const allowed = ['name','phone','role','salaryType','salary','joiningDate','notes','permissions','isActive'];
    const updates = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });
    if (updates.salary) updates.salary = Number(updates.salary);
    const data = await Staff.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, updates, { new: true });
    if (!data) return res.status(404).json({ success: false, message: 'Staff not found.' });
    res.json({ success: true, data });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

const deleteStaff = async (req, res) => {
  try {
    await Staff.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, { isActive: false });
    res.json({ success: true, message: 'Staff removed.' });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

const addPayment = async (req, res) => {
  try {
    const { amount, type, description, date } = req.body;
    if (!amount || Number(amount) <= 0) return res.status(400).json({ success: false, message: 'Valid amount required.' });
    const staff = await Staff.findOne({ _id: req.params.id, userId: req.user._id });
    if (!staff) return res.status(404).json({ success: false, message: 'Staff not found.' });
    staff.paymentHistory.push({ amount: Number(amount), type: type || 'salary', description: description || '', date: date ? new Date(date) : new Date() });
    if (type === 'advance') staff.advanceBalance += Number(amount);
    if (type === 'salary' || type === 'bonus') staff.totalPaid += Number(amount);
    if (type === 'deduction') staff.advanceBalance = Math.max(0, staff.advanceBalance - Number(amount));
    await staff.save();
    res.json({ success: true, data: staff });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

const getSalarySummary = async (req, res) => {
  try {
    const staffList = await Staff.find({ userId: req.user._id, isActive: true }).lean();
    const today = new Date();
    let totalDue = 0;
    const details = staffList.map(s => {
      const daysInMonth = new Date(today.getFullYear(), today.getMonth()+1, 0).getDate();
      const daysWorked  = today.getDate();
      const earned      = parseFloat(((s.salary / daysInMonth) * daysWorked).toFixed(2));
      const due         = parseFloat(Math.max(0, earned - (s.advanceBalance || 0)).toFixed(2));
      totalDue += due;
      return { ...s, earned, due };
    });
    res.json({ success: true, data: { totalDue: parseFloat(totalDue.toFixed(2)), staffCount: staffList.length, details } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

module.exports = { getStaff, getStaffById, createStaff, updateStaff, deleteStaff, addPayment, getSalarySummary };
