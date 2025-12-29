const { Department, Company } = require('../models');
const logger = require('../utils/logger');

class DepartmentService {
  async create(companyId, data) {
    const company = await Company.findByPk(companyId);
    if (!company) throw { statusCode: 404, code: 'ERR_COMPANY_NOT_FOUND', message: 'شرکت یافت نشد' };

    if (data.parentId) {
      const parent = await Department.findOne({ where: { id: data.parentId, companyId } });
      if (!parent) throw { statusCode: 404, code: 'ERR_PARENT_NOT_FOUND', message: 'دپارتمان والد یافت نشد' };
    }

    const dept = await Department.create({ ...data, companyId });
    logger.info('دپارتمان ایجاد شد', { companyId, departmentId: dept.id });
    return this.format(dept);
  }

  async findByCompany(companyId) {
    const depts = await Department.findAll({
      where: { companyId },
      include: [{ model: Department, as: 'parent', attributes: ['id', 'name'] }],
      order: [['name', 'ASC']]
    });
    return depts.map(d => this.format(d));
  }

  async update(companyId, deptId, data) {
    const dept = await Department.findOne({ where: { id: deptId, companyId } });
    if (!dept) throw { statusCode: 404, code: 'ERR_DEPT_NOT_FOUND', message: 'دپارتمان یافت نشد' };

    if (data.parentId && data.parentId !== dept.parentId) {
      if (data.parentId === deptId) throw { statusCode: 400, code: 'ERR_INVALID_PARENT', message: 'دپارتمان نمی‌تواند والد خودش باشد' };
      const parent = await Department.findOne({ where: { id: data.parentId, companyId } });
      if (!parent) throw { statusCode: 404, code: 'ERR_PARENT_NOT_FOUND', message: 'دپارتمان والد یافت نشد' };
    }

    await dept.update(data);
    logger.info('دپارتمان ویرایش شد', { departmentId: deptId });
    return this.format(dept);
  }

  async delete(companyId, deptId) {
    const dept = await Department.findOne({ where: { id: deptId, companyId } });
    if (!dept) throw { statusCode: 404, code: 'ERR_DEPT_NOT_FOUND', message: 'دپارتمان یافت نشد' };

    const { Employee } = require('../models');
    const empCount = await Employee.count({ where: { departmentId: deptId } });
    if (empCount > 0) throw { statusCode: 400, code: 'ERR_DEPT_HAS_EMPLOYEES', message: 'این دپارتمان دارای کارمند است و قابل حذف نیست' };

    const childCount = await Department.count({ where: { parentId: deptId } });
    if (childCount > 0) throw { statusCode: 400, code: 'ERR_DEPT_HAS_CHILDREN', message: 'این دپارتمان دارای زیرمجموعه است' };

    await dept.destroy();
    logger.info('دپارتمان حذف شد', { departmentId: deptId });
    return { id: deptId };
  }

  format(d) {
    return {
      id: d.id, companyId: d.companyId, name: d.name, code: d.code, parentId: d.parentId,
      managerUserId: d.managerUserId, monthlyBudget: d.monthlyBudget ? parseFloat(d.monthlyBudget) : null,
      isActive: d.isActive, createdAt: d.created_at,
      parent: d.parent ? { id: d.parent.id, name: d.parent.name } : null
    };
  }
}

module.exports = new DepartmentService();
