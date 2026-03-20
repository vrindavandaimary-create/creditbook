const router = require('express').Router();
const { getStaff, getStaffById, createStaff, updateStaff, deleteStaff, addPayment, getSalarySummary } = require('../controllers/staffController');
const { protect } = require('../middleware/authMiddleware');
router.use(protect);
router.get('/summary/due', getSalarySummary);
router.get('/', getStaff); router.post('/', createStaff);
router.get('/:id', getStaffById); router.put('/:id', updateStaff); router.delete('/:id', deleteStaff);
router.post('/:id/payment', addPayment);
module.exports = router;
