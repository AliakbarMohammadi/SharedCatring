const express = require('express');
const router = express.Router();
const userController = require('../../controllers/user.controller');
const { requireAuth, restrictTo } = require('../../middlewares');
const {
  validateCreateUser,
  validateUpdateUser,
  validateUpdateStatus,
  validateAssignRole
} = require('../../validators/user.validator');

// Internal routes for service-to-service communication (no auth required)
router.get('/by-email/:email', userController.findByEmailInternal);
router.post('/internal', validateCreateUser, userController.create); // For auth-service registration

// Protected routes - super_admin only
router.get('/', requireAuth, restrictTo('super_admin'), userController.findAll);
router.post('/', requireAuth, restrictTo('super_admin'), validateCreateUser, userController.create);
router.delete('/:id', requireAuth, restrictTo('super_admin'), userController.delete);
router.patch('/:id/status', requireAuth, restrictTo('super_admin'), validateUpdateStatus, userController.updateStatus);
router.post('/:id/assign-role', requireAuth, restrictTo('super_admin'), validateAssignRole, userController.assignRole);

// Protected routes - authenticated users (for own profile or admin)
router.get('/:id', requireAuth, userController.findById);
router.put('/:id', requireAuth, validateUpdateUser, userController.update);
router.patch('/:id', requireAuth, validateUpdateUser, userController.update);
router.patch('/:id/password', requireAuth, userController.updatePassword);

module.exports = router;
