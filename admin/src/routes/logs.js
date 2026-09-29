const express = require('express');
const router = express.Router();
const logsController = require('../controllers/logsController');
const { requireAuth, requirePermission } = require('../middleware/auth');

router.use(requireAuth);

router.get('/logs', requirePermission('logs.view'), (req, res) => logsController.index(req, res));
router.get('/api/logs/tail', requirePermission('logs.view'), (req, res) => logsController.apiTail(req, res));

module.exports = router;
