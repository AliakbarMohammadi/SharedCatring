const express = require('express');
const router = express.Router();
const roleController = require('../../controllers/role.controller');
const { requireAuth, requireSuperAdmin } = require('../../middlewares');
const {
  validateCreateRole,
  validateUpdateRole,
  validateAssignPermissions
} = require('../../validators/role.validator');

// Protected routes - super_admin only
router.get('/', requireAuth, requireSuperAdmin, roleController.findAll);
router.get('/list', requireAuth, requireSuperAdmin, roleController.getSystemRoles);
router.post('/', requireAuth, requireSuperAdmin, validateCreateRole, roleController.create);
router.get('/:id', requireAuth, requireSuperAdmin, roleController.findById);
router.put('/:id', requireAuth, requireSuperAdmin, validateUpdateRole, roleController.update);
router.delete('/:id', requireAuth, requireSuperAdmin, roleController.delete);
router.post('/:id/permissions', requireAuth, requireSuperAdmin, validateAssignPermissions, roleController.assignPermissions);

module.exports = router;
