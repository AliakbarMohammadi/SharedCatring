const express = require('express');
const router = express.Router();
const companyRoutes = require('./v1/company.routes');

router.use('/v1/companies', companyRoutes);

module.exports = router;
