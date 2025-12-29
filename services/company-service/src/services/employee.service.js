const { Employee, Company, Department, DeliveryShift } = require('../models');
const eventPublisher = require('../events/publisher');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

class EmployeeService {
  async create(companyId, data) {
    const company = await Company.findByPk(companyId);
    if (!company) throw { statusCode: 404, code: 'ERR_COMPANY_NOT_FOUND', message: 'شرکت یافت نشد' };

    if (data.departmentId) {
      const dept = await Department.findOne({ where: { id: data.departmentId, companyId } });
      if (!dept) throw { statusCode: 404, code: 'ERR_DEPT_NOT_FOUND', message: 'دپارتمان یافت نشد' };
    }

    const existing = await Employee.findOne({ where: { userId: data.userId, companyId } });
    if (existing) throw { statusCode: 409, code: 'ERR_EMPLOYEE_EXISTS', message: 'این کاربر قبلاً به عنوان کارمند ثبت شده است' };

    const emp = await Employee.create({ ...data, companyId });
    await eventPublisher.publish('employee.added', { employeeId: emp.id, userId: emp.userId, companyId });
    logger.info('کارمند اضافه شد', { companyId, employeeId: emp.id });
    return this.format(emp);
  }

  async bulkCreate(companyId, employees) {
    const company = await Company.findByPk(companyId);
    if (!company) throw { statusCode: 404, code: 'ERR_COMPANY_NOT_FOUND', message: 'شرکت یافت نشد' };

    const results = { success: [], failed: [] };
    for (const empData of employees) {
      try {
        const emp = await Employee.create({ ...empData, companyId });
        results.success.push({ userId: empData.userId, employeeId: emp.id });
      } catch (error) {
        results.failed.push({ userId: empData.userId, error: error.message });
      }
    }

    if (results.success.length > 0) {
      await eventPublisher.publish('employees.bulk_imported', { companyId, count: results.success.length });
    }

    logger.info('افزودن گروهی کارمندان', { companyId, success: results.success.length, failed: results.failed.length });
    return results;
  }

  async findByCompany(companyId, options = {}) {
    const { page = 1, limit = 20, departmentId, status, search } = options;
    const where = { companyId };
    if (departmentId) where.departmentId = departmentId;
    if (status) where.status = status;
    if (search) where[Op.or] = [{ employeeCode: { [Op.iLike]: `%${search}%` } }, { jobTitle: { [Op.iLike]: `%${search}%` } }];

    const { count, rows } = await Employee.findAndCountAll({
      where, limit, offset: (page - 1) * limit,
      include: [
        { model: Department, as: 'department', attributes: ['id', 'name'] },
        { model: DeliveryShift, as: 'shift', attributes: ['id', 'name', 'deliveryTime'] }
      ],
      order: [['created_at', 'DESC']]
    });

    return {
      employees: rows.map(e => this.format(e)),
      pagination: { total: count, page, limit, totalPages: Math.ceil(count / limit) }
    };
  }

  async findById(companyId, empId) {
    const emp = await Employee.findOne({
      where: { id: empId, companyId },
      include: [
        { model: Department, as: 'department', attributes: ['id', 'name'] },
        { model: DeliveryShift, as: 'shift', attributes: ['id', 'name', 'deliveryTime'] }
      ]
    });
    if (!emp) throw { statusCode: 404, code: 'ERR_EMPLOYEE_NOT_FOUND', message: 'کارمند یافت نشد' };
    return this.format(emp);
  }

  async update(companyId, empId, data) {
    const emp = await Employee.findOne({ where: { id: empId, companyId } });
    if (!emp) throw { statusCode: 404, code: 'ERR_EMPLOYEE_NOT_FOUND', message: 'کارمند یافت نشد' };

    if (data.departmentId) {
      const dept = await Department.findOne({ where: { id: data.departmentId, companyId } });
      if (!dept) throw { statusCode: 404, code: 'ERR_DEPT_NOT_FOUND', message: 'دپارتمان یافت نشد' };
    }

    await emp.update(data);
    logger.info('کارمند ویرایش شد', { employeeId: empId });
    return this.format(emp);
  }

  async delete(companyId, empId) {
    const emp = await Employee.findOne({ where: { id: empId, companyId } });
    if (!emp) throw { statusCode: 404, code: 'ERR_EMPLOYEE_NOT_FOUND', message: 'کارمند یافت نشد' };

    await emp.destroy();
    await eventPublisher.publish('employee.removed', { employeeId: empId, userId: emp.userId, companyId });
    logger.info('کارمند حذف شد', { employeeId: empId });
    return { id: empId };
  }

  format(e) {
    return {
      id: e.id, userId: e.userId, companyId: e.companyId, departmentId: e.departmentId,
      employeeCode: e.employeeCode, jobTitle: e.jobTitle, shiftId: e.shiftId,
      dailySubsidyLimit: e.dailySubsidyLimit ? parseFloat(e.dailySubsidyLimit) : null,
      monthlySubsidyLimit: e.monthlySubsidyLimit ? parseFloat(e.monthlySubsidyLimit) : null,
      subsidyPercentage: e.subsidyPercentage, canOrder: e.canOrder, status: e.status, joinedAt: e.joinedAt,
      createdAt: e.created_at, updatedAt: e.updated_at,
      department: e.department ? { id: e.department.id, name: e.department.name } : null,
      shift: e.shift ? { id: e.shift.id, name: e.shift.name, deliveryTime: e.shift.deliveryTime } : null
    };
  }
}

module.exports = new EmployeeService();
