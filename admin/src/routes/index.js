const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const dashboardRoutes = require('./dashboard');
const playerRoutes = require('./players');
const economyRoutes = require('./economy');
const inventoryRoutes = require('./inventory');
const moderationRoutes = require('./moderation');
const guildRoutes = require('./guilds');
const serverRoutes = require('./servers');
const auditRoutes = require('./audit');
const logsRoutes = require('./logs');
const staffRoutes = require('./staff');

router.use('/', authRoutes);
router.use('/', dashboardRoutes);
router.use('/', playerRoutes);
router.use('/', economyRoutes);
router.use('/', inventoryRoutes);
router.use('/', moderationRoutes);
router.use('/', guildRoutes);
router.use('/', serverRoutes);
router.use('/', auditRoutes);
router.use('/', logsRoutes);
router.use('/', staffRoutes);

module.exports = router;
