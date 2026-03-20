const Attendance = require('../models/Attendance');
const Staff = require('../models/Staff');

const markAttendance = async (req, res) => {
  try {
    const { staffId, date, status, note } = req.body;
    if (!staffId || !date || !status) return res.status(400).json({ success: false, message: 'staffId, date, status required.' });
    const staff = await Staff.findOne({ _id: staffId, userId: req.user._id });
    if (!staff) return res.status(404).json({ success: false, message: 'Staff not found.' });
    const d = new Date(date); d.setHours(0,0,0,0);
    const record = await Attendance.findOneAndUpdate(
      { staffId, userId: req.user._id, date: d },
      { $set: { status, note: note || '', userId: req.user._id, staffId, date: d } },
      { new: true, upsert: true }
    );
    res.json({ success: true, data: record });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

const getAttendance = async (req, res) => {
  try {
    const { month, year } = req.query;
    const m = month ? parseInt(month)-1 : new Date().getMonth();
    const y = year  ? parseInt(year)    : new Date().getFullYear();
    const start = new Date(y, m, 1);
    const end   = new Date(y, m+1, 0, 23, 59, 59, 999);
    const data  = await Attendance.find({ staffId: req.params.staffId, userId: req.user._id, date: { $gte: start, $lte: end } }).sort('date').lean();
    res.json({ success: true, count: data.length, data });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

const getTodayAttendance = async (req, res) => {
  try {
    const today = new Date(); today.setHours(0,0,0,0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate()+1);
    const records = await Attendance.find({ userId: req.user._id, date: { $gte: today, $lt: tomorrow } }).populate('staffId','name phone').lean();
    const summary = { present:0, absent:0, half_day:0, paid_leave:0 };
    records.forEach(r => { if (summary[r.status] !== undefined) summary[r.status]++; });
    res.json({ success: true, data: { records, summary } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

const getAttendanceSummary = async (req, res) => {
  try {
    const { month, year } = req.query;
    const m = month ? parseInt(month)-1 : new Date().getMonth();
    const y = year  ? parseInt(year)    : new Date().getFullYear();
    const start = new Date(y, m, 1);
    const end   = new Date(y, m+1, 0, 23, 59, 59, 999);
    const records = await Attendance.find({ staffId: req.params.staffId, userId: req.user._id, date: { $gte: start, $lte: end } }).lean();
    const summary = { present:0, absent:0, half_day:0, paid_leave:0 };
    records.forEach(r => { if (summary[r.status] !== undefined) summary[r.status]++; });
    const staff = await Staff.findById(req.params.staffId).lean();
    const daysInMonth = new Date(y, m+1, 0).getDate();
    const dailyRate = staff ? staff.salary / daysInMonth : 0;
    const effectiveDays = summary.present + summary.half_day * 0.5 + summary.paid_leave;
    const salaryEarned  = parseFloat((dailyRate * effectiveDays).toFixed(2));
    res.json({ success: true, data: { summary, daysInMonth, effectiveDays, salaryEarned, dailyRate: parseFloat(dailyRate.toFixed(2)) } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

module.exports = { markAttendance, getAttendance, getTodayAttendance, getAttendanceSummary };
