const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'creditbook_super_secret_jwt_key_2024_udoy';
const genToken = (id) => jwt.sign({ id }, JWT_SECRET, { expiresIn: '30d' });

const register = async (req, res) => {
  try {
    const { name, email, phone, password, confirmPassword, businessName, businessType } = req.body;
    if (!name?.trim())  return res.status(400).json({ success: false, message: 'Full name is required.' });
    if (!email?.trim()) return res.status(400).json({ success: false, message: 'Email is required.' });
    if (!phone?.trim()) return res.status(400).json({ success: false, message: 'Phone number is required.' });
    if (!password)      return res.status(400).json({ success: false, message: 'Password is required.' });
    if (password.length < 6) return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    if (confirmPassword && password !== confirmPassword) return res.status(400).json({ success: false, message: 'Passwords do not match.' });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) return res.status(400).json({ success: false, message: 'Enter a valid email address.' });

    const existing = await User.findOne({ email: email.trim().toLowerCase() });
    if (existing) return res.status(400).json({ success: false, message: 'Account with this email already exists.' });

    const user = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      password,
      businessName: businessName?.trim() || 'My Business',
      businessType: businessType?.trim() || ''
    });

    res.status(201).json({ success: true, message: 'Account created!', token: genToken(user._id), user });
  } catch (e) {
    if (e.code === 11000) return res.status(400).json({ success: false, message: 'Email already exists.' });
    res.status(500).json({ success: false, message: e.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email?.trim()) return res.status(400).json({ success: false, message: 'Email is required.' });
    if (!password)      return res.status(400).json({ success: false, message: 'Password is required.' });

    const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password');
    if (!user) return res.status(404).json({ success: false, message: 'No account found with this email.' });
    if (!user.isActive) return res.status(401).json({ success: false, message: 'Account is deactivated.' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Incorrect password.' });

    await User.findByIdAndUpdate(user._id, { lastLogin: Date.now() });
    res.json({ success: true, message: 'Login successful!', token: genToken(user._id), user });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, user });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

const updateProfile = async (req, res) => {
  try {
    const { name, phone, businessName, businessType, currency } = req.body;
    const updates = {};
    if (name)         updates.name = name.trim();
    if (phone)        updates.phone = phone.trim();
    if (businessName) updates.businessName = businessName.trim();
    if (businessType !== undefined) updates.businessType = businessType.trim();
    if (currency)     updates.currency = currency;
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
    res.json({ success: true, user });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;
    if (!currentPassword) return res.status(400).json({ success: false, message: 'Current password required.' });
    if (!newPassword || newPassword.length < 6) return res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' });
    if (newPassword !== confirmNewPassword) return res.status(400).json({ success: false, message: 'Passwords do not match.' });
    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password changed.' });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

module.exports = { register, login, getMe, updateProfile, changePassword };
