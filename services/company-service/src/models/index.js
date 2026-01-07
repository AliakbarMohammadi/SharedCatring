const Company = require('./Company');
const DeliveryShift = require('./DeliveryShift');
const Employee = require('./Employee');
const SubsidyRule = require('./SubsidyRule');
const CompanyJoinRequest = require('./CompanyJoinRequest');

// Note: Department model removed - employees are now directly linked to Company

// Associations
Company.hasMany(DeliveryShift, { foreignKey: 'companyId', as: 'shifts' });
DeliveryShift.belongsTo(Company, { foreignKey: 'companyId' });

Company.hasMany(Employee, { foreignKey: 'companyId', as: 'employees' });
Employee.belongsTo(Company, { foreignKey: 'companyId', as: 'company' });

Company.hasMany(SubsidyRule, { foreignKey: 'companyId', as: 'subsidyRules' });
SubsidyRule.belongsTo(Company, { foreignKey: 'companyId' });

DeliveryShift.hasMany(Employee, { foreignKey: 'shiftId', as: 'employees' });
Employee.belongsTo(DeliveryShift, { foreignKey: 'shiftId', as: 'shift' });

// Join Request associations
Company.hasMany(CompanyJoinRequest, { foreignKey: 'companyId', as: 'joinRequests' });
CompanyJoinRequest.belongsTo(Company, { foreignKey: 'companyId', as: 'company' });

module.exports = { Company, DeliveryShift, Employee, SubsidyRule, CompanyJoinRequest };
