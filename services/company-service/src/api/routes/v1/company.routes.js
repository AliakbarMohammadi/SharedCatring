const express = require('express');
const router = express.Router();
const companyController = require('../../controllers/company.controller');
const departmentController = require('../../controllers/department.controller');
const employeeController = require('../../controllers/employee.controller');
const shiftController = require('../../controllers/shift.controller');
const subsidyController = require('../../controllers/subsidy.controller');

const { validateCreateCompany, validateUpdateCompany, validateUpdateStatus } = require('../../validators/company.validator');
const { validateCreateDept, validateUpdateDept } = require('../../validators/department.validator');
const { validateCreateEmp, validateUpdateEmp } = require('../../validators/employee.validator');
const { validateCreateShift, validateUpdateShift } = require('../../validators/shift.validator');
const { validateCreateSubsidy, validateUpdateSubsidy } = require('../../validators/subsidy.validator');

// Companies
router.post('/', validateCreateCompany, companyController.create);
router.get('/', companyController.findAll);
router.get('/:id', companyController.findById);
router.put('/:id', validateUpdateCompany, companyController.update);
router.patch('/:id/status', validateUpdateStatus, companyController.updateStatus);
router.get('/:id/dashboard', companyController.getDashboard);

// Departments
router.post('/:id/departments', validateCreateDept, departmentController.create);
router.get('/:id/departments', departmentController.findByCompany);
router.put('/:id/departments/:deptId', validateUpdateDept, departmentController.update);
router.delete('/:id/departments/:deptId', departmentController.delete);

// Employees
router.post('/:id/employees', validateCreateEmp, employeeController.create);
router.post('/:id/employees/bulk', employeeController.bulkCreate);
router.get('/:id/employees', employeeController.findByCompany);
router.get('/:id/employees/export', employeeController.export);
router.get('/:id/employees/:empId', employeeController.findById);
router.put('/:id/employees/:empId', validateUpdateEmp, employeeController.update);
router.delete('/:id/employees/:empId', employeeController.delete);

// Shifts
router.post('/:id/shifts', validateCreateShift, shiftController.create);
router.get('/:id/shifts', shiftController.findByCompany);
router.put('/:id/shifts/:shiftId', validateUpdateShift, shiftController.update);

// Subsidy Rules
router.post('/:id/subsidy-rules', validateCreateSubsidy, subsidyController.create);
router.get('/:id/subsidy-rules', subsidyController.findByCompany);
router.put('/:id/subsidy-rules/:ruleId', validateUpdateSubsidy, subsidyController.update);

module.exports = router;
