const router = require('express').Router();
const { chat } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');
router.use(protect);
router.post('/', chat);
module.exports = router;
