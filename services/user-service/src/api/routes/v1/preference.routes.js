const express = require('express');
const router = express.Router();
const preferenceController = require('../../controllers/preference.controller');
const { validateUpdatePreference } = require('../../validators/preference.validator');
const { extractUser } = require('../../middlewares');

router.get('/preferences', extractUser, preferenceController.getPreferences);
router.put('/preferences', extractUser, validateUpdatePreference, preferenceController.updatePreferences);

module.exports = router;
