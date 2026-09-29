const express = require('express');
const router = express.Router();
const serverController = require('../controllers/serverController');
const { requireAuth, requirePermission } = require('../middleware/auth');

router.use(requireAuth);

router.get('/servers', requirePermission('server.view'), (req, res) => serverController.index(req, res));
router.post('/servers/restart-game', requirePermission('server.restart_game'), (req, res) => serverController.restartGame(req, res));
router.post('/servers/restart-web', requirePermission('server.restart_web'), (req, res) => serverController.restartWeb(req, res));
router.post('/servers/restart-scheduler', requirePermission('server.restart_game'), (req, res) => serverController.restartScheduler(req, res));
router.post('/servers/run-rankings', requirePermission('server.restart_game'), (req, res) => serverController.runRankings(req, res));

module.exports = router;
