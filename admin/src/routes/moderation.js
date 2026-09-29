const express = require('express');
const router = express.Router();
const moderationController = require('../controllers/moderationController');
const { requireAuth, requirePermission } = require('../middleware/auth');

router.use(requireAuth);

router.get('/moderation', requirePermission('moderation.view'), (req, res) => moderationController.index(req, res));
router.post('/moderation/ban', requirePermission('moderation.ban'), (req, res) => moderationController.ban(req, res));
router.post('/moderation/unban', requirePermission('moderation.unban'), (req, res) => moderationController.unban(req, res));
router.post('/moderation/unmute', requirePermission('moderation.mute'), (req, res) => moderationController.unmute(req, res));

router.get('/moderation/ip-bans', requirePermission('moderation.view'), (req, res) => moderationController.ipBans(req, res));
router.post('/moderation/ip-bans', requirePermission('moderation.ban_ip'), (req, res) => moderationController.banIp(req, res));
router.post('/moderation/ip-bans/:id/delete', requirePermission('moderation.ban_ip'), (req, res) => moderationController.unbanIp(req, res));

router.get('/moderation/sessions', requirePermission('moderation.view'), (req, res) => moderationController.sessions(req, res));
router.post('/moderation/sessions/:id/kick', requirePermission('moderation.kick'), (req, res) => moderationController.kickSession(req, res));

module.exports = router;
