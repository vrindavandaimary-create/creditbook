const router = require('express').Router();
const { getDashboard, getCashflow } = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');
router.use(protect);
router.get('/', getDashboard); router.get('/cashflow', getCashflow);
module.exports = router;
