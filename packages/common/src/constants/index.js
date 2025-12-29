const roles = require('./roles');
const orderStatus = require('./orderStatus');
const companyStatus = require('./companyStatus');

module.exports = {
  ...roles,
  ...orderStatus,
  ...companyStatus
};
