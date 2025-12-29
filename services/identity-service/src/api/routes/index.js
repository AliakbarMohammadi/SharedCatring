const express = require('express');
const router = express.Router();

const userRoutes = require('./v1/user.routes');
const roleRoutes = require('./v1/role.routes');
const permissionRoutes = require('./v1/permission.routes');

router.use('/v1/identity/users', userRoutes);
router.use('/v1/identity/roles', roleRoutes);
router.use('/v1/identity/permissions', permissionRoutes);

module.exports = router;
