const express = require('express');
const router = express.Router();
const companyController = require('../../controllers/company.controller');
const employeeController = require('../../controllers/employee.controller');
const shiftController = require('../../controllers/shift.controller');
const subsidyController = require('../../controllers/subsidy.controller');
const joinRequestController = require('../../controllers/joinRequest.controller');
const { requireSuperAdmin, requireAuth } = require('../../middlewares');

const { validateCreateCompany, validateUpdateCompany, validateUpdateStatus } = require('../../validators/company.validator');
const { validateUpdateEmp } = require('../../validators/employee.validator');
const { validateCreateShift, validateUpdateShift } = require('../../validators/shift.validator');
const { validateCreateSubsidy, validateUpdateSubsidy } = require('../../validators/subsidy.validator');
const { validateJoinRequest, validateRequestStatus } = require('../../validators/joinRequest.validator');

// ============================================
// STATIC ROUTES FIRST (before /:id)
// ============================================

// Company stats (super_admin only)
router.get('/stats', requireSuperAdmin, companyController.getStats);

// Companies - Public list for discovery (authenticated users)
router.get('/discover', requireAuth, companyController.discoverCompanies);

// Join Requests - User's own requests
router.get('/my-requests', requireAuth, joinRequestController.getMyRequests);

// Join Requests - Admin actions on specific request
router.patch('/requests/:requestId/status', requireAuth, validateRequestStatus, joinRequestController.updateStatus);
router.delete('/requests/:requestId', requireAuth, joinRequestController.cancel);

// Companies list
router.get('/', companyController.findAll);

// Create company
router.post('/', requireAuth, validateCreateCompany, companyController.create);

// ============================================
// DYNAMIC ROUTES (/:id) - MUST BE AFTER STATIC
// ============================================

// Company by ID
router.get('/:id', companyController.findById);
router.put('/:id', requireAuth, validateUpdateCompany, companyController.update);

// Company status update - SUPER ADMIN ONLY
router.patch('/:id/status', requireSuperAdmin, validateUpdateStatus, companyController.updateStatus);

// Company dashboard
router.get('/:id/dashboard', requireAuth, companyController.getDashboard);

// Join Requests - for a specific company
router.post('/:id/join', requireAuth, validateJoinRequest, joinRequestController.create);
router.get('/:id/requests', requireAuth, joinRequestController.findByCompany);
router.get('/:id/join-requests', requireAuth, joinRequestController.findByCompany);

// Employees - static routes first
router.get('/:id/employees', requireAuth, employeeController.findByCompany);
router.get('/:id/employees/export', requireAuth, employeeController.export);
// Employees - dynamic routes after
router.get('/:id/employees/:empId', requireAuth, employeeController.findById);
router.put('/:id/employees/:empId', requireAuth, validateUpdateEmp, employeeController.update);
router.delete('/:id/employees/:empId', requireAuth, employeeController.remove);

// Shifts
router.post('/:id/shifts', requireAuth, validateCreateShift, shiftController.create);
router.get('/:id/shifts', requireAuth, shiftController.findByCompany);
router.put('/:id/shifts/:shiftId', requireAuth, validateUpdateShift, shiftController.update);

// Subsidy Rules
router.post('/:id/subsidy-rules', requireAuth, validateCreateSubsidy, subsidyController.create);
router.get('/:id/subsidy-rules', requireAuth, subsidyController.findByCompany);
router.put('/:id/subsidy-rules/:ruleId', requireAuth, validateUpdateSubsidy, subsidyController.update);

// Subsidy Calculation (Internal API - no auth for service-to-service)
router.post('/:id/subsidy/calculate', subsidyController.calculate);
router.get('/:id/employee-info', subsidyController.getEmployeeInfo);

module.exports = router;
