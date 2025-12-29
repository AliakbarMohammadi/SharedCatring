const express = require('express');
const router = express.Router();
const authController = require('../../controllers/auth.controller');
const {
  validateRegister,
  validateLogin,
  validateRefreshToken,
  validateForgotPassword,
  validateResetPassword,
  validateVerifyToken
} = require('../../validators/auth.validator');
const {
  authenticate,
  loginLimiter,
  passwordResetLimiter
} = require('../../middlewares');

/**
 * @route POST /api/v1/auth/register
 * @desc Register new user
 * @access Public
 */
router.post('/register', validateRegister, authController.register);

/**
 * @route POST /api/v1/auth/login
 * @desc Login user
 * @access Public
 */
router.post('/login', loginLimiter, validateLogin, authController.login);

/**
 * @route POST /api/v1/auth/refresh-token
 * @desc Refresh access token
 * @access Public
 */
router.post('/refresh-token', validateRefreshToken, authController.refreshToken);

/**
 * @route POST /api/v1/auth/logout
 * @desc Logout user
 * @access Private
 */
router.post('/logout', authenticate, authController.logout);

/**
 * @route POST /api/v1/auth/logout-all
 * @desc Logout from all devices
 * @access Private
 */
router.post('/logout-all', authenticate, authController.logoutAll);

/**
 * @route POST /api/v1/auth/forgot-password
 * @desc Request password reset
 * @access Public
 */
router.post('/forgot-password', passwordResetLimiter, validateForgotPassword, authController.forgotPassword);

/**
 * @route POST /api/v1/auth/reset-password
 * @desc Reset password with token
 * @access Public
 */
router.post('/reset-password', validateResetPassword, authController.resetPassword);

/**
 * @route POST /api/v1/auth/verify-token
 * @desc Verify access token
 * @access Public
 */
router.post('/verify-token', validateVerifyToken, authController.verifyToken);

/**
 * @route GET /api/v1/auth/sessions
 * @desc Get user active sessions
 * @access Private
 */
router.get('/sessions', authenticate, authController.getSessions);

module.exports = router;
