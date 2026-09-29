const express = require('express');
const router = express.Router();
const economyController = require('../controllers/economyController');
const { requireAuth, requirePermission } = require('../middleware/auth');

router.use(requireAuth);

router.get('/economy', requirePermission('economy.view'), (req, res) => economyController.index(req, res));
router.post('/economy/modify', requirePermission('economy.add_gold'), (req, res) => economyController.modifyFunds(req, res));
router.post('/economy/airdrop', requirePermission('economy.add_cash'), (req, res) => economyController.massAirdrop(req, res));

router.get('/economy/pincodes', requirePermission('economy.view'), (req, res) => economyController.pincodes(req, res));
router.post('/economy/pincodes', requirePermission('economy.add_cash'), (req, res) => economyController.createPincode(req, res));
router.post('/economy/pincodes/:id/delete', requirePermission('economy.remove_cash'), (req, res) => economyController.deletePincode(req, res));

module.exports = router;
