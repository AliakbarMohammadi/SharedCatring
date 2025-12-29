const express = require('express');
const router = express.Router();

const profileRoutes = require('./v1/profile.routes');
const preferenceRoutes = require('./v1/preference.routes');
const addressRoutes = require('./v1/address.routes');

router.use('/v1/users', profileRoutes);
router.use('/v1/users', preferenceRoutes);
router.use('/v1/users', addressRoutes);

module.exports = router;
