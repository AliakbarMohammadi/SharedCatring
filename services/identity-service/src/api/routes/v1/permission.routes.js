const express = require('express');
const router = express.Router();
const permissionController = require('../../controllers/permission.controller');

router.get('/', permissionController.findAll);

module.exports = router;
