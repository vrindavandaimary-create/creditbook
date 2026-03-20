const router = require('express').Router();
const { getParties, getParty, createParty, updateParty, deleteParty, getSummaryTotals } = require('../controllers/partyController');
const { protect } = require('../middleware/authMiddleware');
router.use(protect);
router.get('/summary/totals', getSummaryTotals);
router.get('/', getParties); router.post('/', createParty);
router.get('/:id', getParty); router.put('/:id', updateParty); router.delete('/:id', deleteParty);
module.exports = router;
