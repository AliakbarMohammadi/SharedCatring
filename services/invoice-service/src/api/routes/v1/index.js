const express = require('express');
const router = express.Router();

const invoiceRoutes = require('./invoice.routes');

router.use('/', invoiceRoutes);

module.exports = router;
