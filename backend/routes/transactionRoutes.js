const router = require('express').Router();
const { addTransaction, getTransactions, deleteTransaction } = require('../controllers/transactionController');
const { protect } = require('../middleware/authMiddleware');
router.use(protect);
router.get('/', getTransactions); router.post('/', addTransaction); router.delete('/:id', deleteTransaction);
module.exports = router;
