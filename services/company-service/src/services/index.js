const companyService = require('./company.service');
const employeeService = require('./employee.service');
const shiftService = require('./shift.service');
const subsidyService = require('./subsidy.service');
const joinRequestService = require('./joinRequest.service');

// Note: departmentService removed

module.exports = {
  companyService,
  employeeService,
  shiftService,
  subsidyService,
  joinRequestService
};
