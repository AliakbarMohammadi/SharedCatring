const express = require('express');
const reportRoutes = require('./report.routes');

const router = express.Router();

router.use('/', reportRoutes);

module.exports = router;
