const express = require('express');
const router = express.Router();
const playerController = require('../controllers/playerController');
const { requireAuth, requirePermission } = require('../middleware/auth');

router.use(requireAuth);

router.get('/players', requirePermission('players.view'), (req, res) => playerController.index(req, res));
router.get('/players/:id', requirePermission('players.view'), (req, res) => playerController.show(req, res));
router.post('/players/:id/edit', requirePermission('players.edit'), (req, res) => playerController.update(req, res));
router.post('/players/:id/rank', requirePermission('players.change_rank'), (req, res) => playerController.updateRank(req, res));
router.post('/players/:id/gm', requirePermission('players.manage_staff'), (req, res) => playerController.toggleGM(req, res));
router.post('/players/:id/password', requirePermission('players.edit'), (req, res) => playerController.resetPassword(req, res));
router.post('/players/:id/mute', requirePermission('moderation.mute'), (req, res) => playerController.toggleMute(req, res));
router.post('/players/:id/kick', requirePermission('moderation.kick'), (req, res) => playerController.kick(req, res));

module.exports = router;
