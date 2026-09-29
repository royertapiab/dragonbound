const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { requireGuest, requireAuth } = require('../middleware/auth');
const { loginRateLimiter } = require('../middleware/rateLimiter');

// Login routes
router.get('/login', requireGuest, authController.showLogin.bind(authController));
router.post('/login', requireGuest, loginRateLimiter, authController.processLogin.bind(authController));

// Logout routes (both GET and POST for convenience)
router.get('/logout', authController.logout.bind(authController));
router.post('/logout', authController.logout.bind(authController));

module.exports = router;
