const express = require('express');
const router = express.Router();
const roleController = require('../../controllers/role.controller');
const {
  validateCreateRole,
  validateUpdateRole,
  validateAssignPermissions
} = require('../../validators/role.validator');

router.post('/', validateCreateRole, roleController.create);
router.get('/', roleController.findAll);
router.get('/:id', roleController.findById);
router.put('/:id', validateUpdateRole, roleController.update);
router.delete('/:id', roleController.delete);
router.post('/:id/permissions', validateAssignPermissions, roleController.assignPermissions);

module.exports = router;
