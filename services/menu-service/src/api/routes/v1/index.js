const express = require('express');
const router = express.Router();

const categoryRoutes = require('./category.routes');
const foodItemRoutes = require('./foodItem.routes');
const menuScheduleRoutes = require('./menuSchedule.routes');
const promotionRoutes = require('./promotion.routes');

router.use('/categories', categoryRoutes);
router.use('/items', foodItemRoutes);
router.use('/', menuScheduleRoutes);
router.use('/promotions', promotionRoutes);

module.exports = router;
