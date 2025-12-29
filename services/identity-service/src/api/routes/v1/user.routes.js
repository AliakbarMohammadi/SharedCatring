const express = require('express');
const router = express.Router();
const userController = require('../../controllers/user.controller');
const {
  validateCreateUser,
  validateUpdateUser,
  validateUpdateStatus,
  validateAssignRole
} = require('../../validators/user.validator');

router.post('/', validateCreateUser, userController.create);
router.get('/', userController.findAll);
router.get('/:id', userController.findById);
router.put('/:id', validateUpdateUser, userController.update);
router.delete('/:id', userController.delete);
router.patch('/:id/status', validateUpdateStatus, userController.updateStatus);
router.post('/:id/assign-role', validateAssignRole, userController.assignRole);

module.exports = router;
