const express = require('express');
const router = express.Router();
const userController = require('../../controllers/userController');
const { validate, createUserSchema, updateUserSchema, updateStatusSchema } = require('../../validators/userValidator');

// Get user stats (admin only)
router.get('/stats', userController.getStats);

// Get all users (admin only)
router.get('/', userController.getAll);

// Get users by company
router.get('/company/:companyId', userController.getByCompany);

// Get user by ID
router.get('/:id', userController.getById);

// Create user
router.post('/', validate(createUserSchema), userController.create);

// Update user
router.put('/:id', validate(updateUserSchema), userController.update);

// Update user status
router.patch('/:id/status', validate(updateStatusSchema), userController.updateStatus);

// Update user preferences
router.patch('/:id/preferences', userController.updatePreferences);

// Assign user to company
router.post('/:id/assign-company', userController.assignToCompany);

// Delete user
router.delete('/:id', userController.delete);

module.exports = router;
