const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  amount:      { type: Number, required: true },
  type:        { type: String, enum: ['salary', 'advance', 'bonus', 'deduction'], default: 'salary' },
  description: { type: String, default: '' },
  date:        { type: Date, default: Date.now }
}, { _id: true });

const staffSchema = new mongoose.Schema({
  userId:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name:           { type: String, required: true, trim: true },
  phone:          { type: String, default: '', trim: true },
  role:           { type: String, default: '', trim: true },
  salaryType:     { type: String, enum: ['monthly', 'daily', 'weekly'], default: 'monthly' },
  salary:         { type: Number, required: true, min: 0 },
  joiningDate:    { type: Date, default: Date.now },
  advanceBalance: { type: Number, default: 0 },
  totalPaid:      { type: Number, default: 0 },
  permissions: {
    viewReports:     { type: Boolean, default: false },
    addTransactions: { type: Boolean, default: false },
    manageParties:   { type: Boolean, default: false }
  },
  paymentHistory: [paymentSchema],
  isActive:       { type: Boolean, default: true },
  notes:          { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Staff', staffSchema);
