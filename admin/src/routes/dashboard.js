const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { requireAuth, requirePermission } = require('../middleware/auth');

router.get('/', requireAuth, requirePermission('dashboard.view'), dashboardController.index.bind(dashboardController));
router.get('/api/stats', requireAuth, requirePermission('dashboard.view'), dashboardController.apiStats.bind(dashboardController));

module.exports = router;
