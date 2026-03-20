const mongoose = require('mongoose');

const partySchema = new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name:     { type: String, required: true, trim: true },
  phone:    { type: String, default: '', trim: true },
  email:    { type: String, default: '', trim: true, lowercase: true },
  address:  { type: String, default: '', trim: true },
  type:     { type: String, enum: ['customer', 'supplier'], required: true, index: true },
  balance:  { type: Number, default: 0 },
  notes:    { type: String, default: '' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

partySchema.index({ userId: 1, type: 1, updatedAt: -1 });
module.exports = mongoose.model('Party', partySchema);
