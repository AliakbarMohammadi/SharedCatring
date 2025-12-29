const express = require('express');
const router = express.Router();
const orderController = require('../../controllers/orderController');

// User orders
router.get('/my-orders', orderController.getMyOrders);
router.post('/', orderController.create);
router.get('/:id', orderController.getById);
router.post('/:id/cancel', orderController.cancel);

// Company orders (admin)
router.get('/company/:companyId', orderController.getCompanyOrders);
router.patch('/:id/status', orderController.updateStatus);

// Stats
router.get('/stats/:companyId', orderController.getStats);
router.get('/summary/:companyId', orderController.getDailySummary);

module.exports = router;
