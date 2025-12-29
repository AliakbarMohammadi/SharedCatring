const express = require('express');
const router = express.Router();
const addressController = require('../../controllers/address.controller');
const { validateCreateAddress, validateUpdateAddress } = require('../../validators/address.validator');
const { extractUser } = require('../../middlewares');

router.get('/addresses', extractUser, addressController.getAddresses);
router.post('/addresses', extractUser, validateCreateAddress, addressController.createAddress);
router.put('/addresses/:id', extractUser, validateUpdateAddress, addressController.updateAddress);
router.delete('/addresses/:id', extractUser, addressController.deleteAddress);
router.patch('/addresses/:id/default', extractUser, addressController.setDefaultAddress);

module.exports = router;
