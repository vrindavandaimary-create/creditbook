const router = require('express').Router();
const { markAttendance, getAttendance, getTodayAttendance, getAttendanceSummary } = require('../controllers/attendanceController');
const { protect } = require('../middleware/authMiddleware');
router.use(protect);
router.get('/summary/today', getTodayAttendance);
router.post('/', markAttendance);
router.get('/:staffId', getAttendance); router.get('/:staffId/summary', getAttendanceSummary);
module.exports = router;
