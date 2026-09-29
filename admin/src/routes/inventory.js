const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { requireAuth, requirePermission } = require('../middleware/auth');

router.use(requireAuth);

router.get('/inventory', requirePermission('inventory.view'), (req, res) => inventoryController.catalog(req, res));
router.get('/inventory/player/:id', requirePermission('inventory.view'), (req, res) => inventoryController.playerInventory(req, res));
router.post('/inventory/grant', requirePermission('inventory.add'), (req, res) => inventoryController.grant(req, res));
router.post('/inventory/mass-grant', requirePermission('inventory.add'), (req, res) => inventoryController.massGrant(req, res));
router.post('/inventory/:id/remove', requirePermission('inventory.remove'), (req, res) => inventoryController.remove(req, res));
router.post('/inventory/:id/restore', requirePermission('inventory.add'), (req, res) => inventoryController.restore(req, res));
router.post('/inventory/:id/delete', requirePermission('inventory.remove'), (req, res) => inventoryController.delete(req, res));

module.exports = router;
