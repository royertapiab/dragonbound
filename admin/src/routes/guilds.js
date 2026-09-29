const express = require('express');
const router = express.Router();
const guildController = require('../controllers/guildController');
const { requireAuth, requirePermission } = require('../middleware/auth');

router.use(requireAuth);

router.get('/guilds', requirePermission('guilds.view'), (req, res) => guildController.index(req, res));
router.get('/guilds/:id', requirePermission('guilds.view'), (req, res) => guildController.show(req, res));
router.post('/guilds/:id/edit', requirePermission('guilds.edit'), (req, res) => guildController.update(req, res));
router.post('/guilds/:id/members/:userId/remove', requirePermission('guilds.edit'), (req, res) => guildController.removeMember(req, res));
router.post('/guilds/:id/transfer', requirePermission('guilds.edit'), (req, res) => guildController.transferMaster(req, res));
router.post('/guilds/:id/delete', requirePermission('guilds.edit'), (req, res) => guildController.delete(req, res));

module.exports = router;
