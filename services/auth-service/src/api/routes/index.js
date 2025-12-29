const express = require('express');
const router = express.Router();
const authRoutes = require('./v1/auth.routes');

// API v1 routes
router.use('/v1/auth', authRoutes);

module.exports = router;
