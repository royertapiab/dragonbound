const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');
const { requireAuth, requirePermission } = require('../middleware/auth');

router.use(requireAuth);

router.get('/staff', requirePermission('staff.view'), (req, res) => staffController.index(req, res));
router.post('/staff', requirePermission('staff.create'), (req, res) => staffController.add(req, res));
router.post('/staff/:id/role', requirePermission('staff.edit'), (req, res) => staffController.updateRole(req, res));
router.post('/staff/:id/status', requirePermission('staff.edit'), (req, res) => staffController.toggleStatus(req, res));
router.post('/staff/:id/delete', requirePermission('staff.remove'), (req, res) => staffController.delete(req, res));

module.exports = router;
