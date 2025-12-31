const express = require('express');
const router = express.Router();

const notificationRoutes = require('./notification.routes');

router.use('/', notificationRoutes);

module.exports = router;
