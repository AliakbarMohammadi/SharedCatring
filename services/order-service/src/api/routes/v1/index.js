const express = require('express');
const router = express.Router();

const cartRoutes = require('./cart.routes');
const orderRoutes = require('./order.routes');
const reservationRoutes = require('./reservation.routes');

router.use('/cart', cartRoutes);
router.use('/reservations', reservationRoutes);
router.use('/', orderRoutes);

module.exports = router;
