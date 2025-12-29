const express = require('express');
const router = express.Router();
const menuController = require('../../controllers/menuController');

// Category routes
router.get('/categories', menuController.getCategories);
router.get('/categories/:id', menuController.getCategoryById);
router.post('/categories', menuController.createCategory);
router.put('/categories/:id', menuController.updateCategory);
router.delete('/categories/:id', menuController.deleteCategory);

// Menu Item routes
router.get('/items', menuController.getMenuItems);
router.get('/items/:id', menuController.getMenuItemById);
router.post('/items', menuController.createMenuItem);
router.put('/items/:id', menuController.updateMenuItem);
router.patch('/items/:id/availability', menuController.updateItemAvailability);
router.delete('/items/:id', menuController.deleteMenuItem);

// Daily Menu routes
router.get('/daily', menuController.getDailyMenus);
router.get('/daily/:id', menuController.getDailyMenuById);
router.post('/daily', menuController.createDailyMenu);
router.put('/daily/:id', menuController.updateDailyMenu);
router.post('/daily/:id/items', menuController.addItemToDailyMenu);
router.delete('/daily/:id/items/:itemId', menuController.removeItemFromDailyMenu);

module.exports = router;
