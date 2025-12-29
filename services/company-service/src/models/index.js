const Company = require('./Company');
const Department = require('./Department');
const DeliveryShift = require('./DeliveryShift');
const Employee = require('./Employee');
const SubsidyRule = require('./SubsidyRule');

// Associations
Company.hasMany(Department, { foreignKey: 'companyId', as: 'departments' });
Department.belongsTo(Company, { foreignKey: 'companyId' });

Company.hasMany(DeliveryShift, { foreignKey: 'companyId', as: 'shifts' });
DeliveryShift.belongsTo(Company, { foreignKey: 'companyId' });

Company.hasMany(Employee, { foreignKey: 'companyId', as: 'employees' });
Employee.belongsTo(Company, { foreignKey: 'companyId' });

Company.hasMany(SubsidyRule, { foreignKey: 'companyId', as: 'subsidyRules' });
SubsidyRule.belongsTo(Company, { foreignKey: 'companyId' });

Department.hasMany(Employee, { foreignKey: 'departmentId', as: 'employees' });
Employee.belongsTo(Department, { foreignKey: 'departmentId', as: 'department' });

DeliveryShift.hasMany(Employee, { foreignKey: 'shiftId', as: 'employees' });
Employee.belongsTo(DeliveryShift, { foreignKey: 'shiftId', as: 'shift' });

Department.hasMany(Department, { foreignKey: 'parentId', as: 'children' });
Department.belongsTo(Department, { foreignKey: 'parentId', as: 'parent' });

module.exports = { Company, Department, DeliveryShift, Employee, SubsidyRule };
