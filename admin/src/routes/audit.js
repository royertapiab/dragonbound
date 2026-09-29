const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');
const { requireAuth, requirePermission } = require('../middleware/auth');

router.use(requireAuth);

router.get('/audit', requirePermission('audit.view'), (req, res) => auditController.index(req, res));

module.exports = router;
