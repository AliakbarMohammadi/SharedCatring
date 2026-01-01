const express = require('express');
const router = express.Router();
const profileController = require('../../controllers/profile.controller');
const { validateUpdateProfile, validateUpdateAvatar } = require('../../validators/profile.validator');
const { extractUser } = require('../../middlewares');

router.get('/profile', extractUser, profileController.getProfile);
router.put('/profile', extractUser, validateUpdateProfile, profileController.updateProfile);
router.patch('/profile', extractUser, validateUpdateProfile, profileController.updateProfile); // PATCH for partial updates
router.put('/profile/avatar', extractUser, validateUpdateAvatar, profileController.updateAvatar);
router.patch('/profile/avatar', extractUser, validateUpdateAvatar, profileController.updateAvatar);

module.exports = router;
