const { Employee, Company, DeliveryShift } = require('../models');
const eventPublisher = require('../events/publisher');
const logger = require('../utils/logger');
const { Op } = require('sequelize');
const axios = require('axios');

const IDENTITY_SERVICE_URL = process.env.IDENTITY_SERVICE_URL || 'http://localhost:3002';

class EmployeeService {
  /**
   * Create employee (internal use - called after join request approval)
   * ایجاد کارمند - استفاده داخلی
   */
  async create(companyId, data) {
    const company = await Company.findByPk(companyId);
    if (!company) {
      throw { statusCode: 404, code: 'ERR_COMPANY_NOT_FOUND', message: 'شرکت یافت نشد' };
    }

    const existing = await Employee.findOne({ where: { userId: data.userId } });
    if (existing) {
      throw { statusCode: 409, code: 'ERR_EMPLOYEE_EXISTS', message: 'این کاربر قبلاً کارمند یک شرکت است' };
    }

    const emp = await Employee.create({ ...data, companyId });
    await eventPublisher.publish('employee.added', { 
      employeeId: emp.id, 
      userId: emp.userId, 
      companyId 
    });
    
    logger.info('کارمند اضافه شد', { companyId, employeeId: emp.id });
    return this.format(emp);
  }

  /**
   * Find employees by company
   * دریافت کارمندان یک شرکت
   */
  async findByCompany(companyId, options = {}) {
    const { page = 1, limit = 20, status, search } = options;
    const where = { companyId };
    if (status) where.status = status;
    if (search) {
      where[Op.or] = [
        { employeeCode: { [Op.iLike]: `%${search}%` } },
        { jobTitle: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows } = await Employee.findAndCountAll({
      where,
      limit,
      offset: (page - 1) * limit,
      include: [
        { model: Company, as: 'company', attributes: ['id', 'name'] },
        { model: DeliveryShift, as: 'shift', attributes: ['id', 'name', 'deliveryTime'] }
      ],
      order: [['created_at', 'DESC']]
    });

    return {
      employees: rows.map(e => this.format(e)),
      pagination: { total: count, page, limit, totalPages: Math.ceil(count / limit) }
    };
  }

  /**
   * Find employee by ID
   * دریافت کارمند با شناسه
   */
  async findById(companyId, empId) {
    const emp = await Employee.findOne({
      where: { id: empId, companyId },
      include: [
        { model: Company, as: 'company', attributes: ['id', 'name'] },
        { model: DeliveryShift, as: 'shift', attributes: ['id', 'name', 'deliveryTime'] }
      ]
    });
    if (!emp) {
      throw { statusCode: 404, code: 'ERR_EMPLOYEE_NOT_FOUND', message: 'کارمند یافت نشد' };
    }
    return this.format(emp);
  }

  /**
   * Find employee by user ID
   * دریافت کارمند با شناسه کاربر
   */
  async findByUserId(userId) {
    const emp = await Employee.findOne({
      where: { userId },
      include: [
        { model: Company, as: 'company', attributes: ['id', 'name', 'logoUrl'] },
        { model: DeliveryShift, as: 'shift', attributes: ['id', 'name', 'deliveryTime'] }
      ]
    });
    return emp ? this.format(emp) : null;
  }

  /**
   * Update employee
   * ویرایش کارمند
   */
  async update(companyId, empId, data) {
    const emp = await Employee.findOne({ where: { id: empId, companyId } });
    if (!emp) {
      throw { statusCode: 404, code: 'ERR_EMPLOYEE_NOT_FOUND', message: 'کارمند یافت نشد' };
    }

    // Validate shift if provided
    if (data.shiftId) {
      const shift = await DeliveryShift.findOne({ where: { id: data.shiftId, companyId } });
      if (!shift) {
        throw { statusCode: 404, code: 'ERR_SHIFT_NOT_FOUND', message: 'شیفت یافت نشد' };
      }
    }

    await emp.update(data);
    logger.info('کارمند ویرایش شد', { employeeId: empId });
    return this.format(emp);
  }

  /**
   * Remove employee from company (admin only)
   * حذف کارمند از شرکت - فقط توسط ادمین
   * This also reverts user role to personal_user
   */
  async remove(companyId, empId, removedBy) {
    const emp = await Employee.findOne({ where: { id: empId, companyId } });
    if (!emp) {
      throw { statusCode: 404, code: 'ERR_EMPLOYEE_NOT_FOUND', message: 'کارمند یافت نشد' };
    }

    const userId = emp.userId;

    // Delete employee record
    await emp.destroy();

    // Revert user role to personal_user and remove companyId
    try {
      await this.revertUserRole(userId);
    } catch (error) {
      logger.error('خطا در بازگرداندن نقش کاربر', { userId, error: error.message });
      // Don't throw - employee is removed, role revert can be retried
    }

    await eventPublisher.publish('employee.removed', { 
      employeeId: empId, 
      userId, 
      companyId,
      removedBy
    });

    logger.info('کارمند از شرکت حذف شد', { employeeId: empId, userId, companyId });
    return { id: empId, userId };
  }

  /**
   * Revert user role to personal_user
   * بازگرداندن نقش کاربر به کاربر عادی
   */
  async revertUserRole(userId) {
    try {
      // Change role to personal_user
      await axios.post(
        `${IDENTITY_SERVICE_URL}/api/v1/identity/users/${userId}/assign-role`,
        { role: 'personal_user' },
        { 
          headers: { 
            'Content-Type': 'application/json',
            'x-user-role': 'super_admin',
            'x-user-id': 'system'
          },
          timeout: 5000
        }
      );

      // Remove companyId from user
      await axios.patch(
        `${IDENTITY_SERVICE_URL}/api/v1/identity/users/${userId}`,
        { companyId: null },
        { 
          headers: { 
            'Content-Type': 'application/json',
            'x-user-role': 'super_admin',
            'x-user-id': 'system'
          },
          timeout: 5000
        }
      );

      logger.info('نقش کاربر به personal_user بازگردانده شد', { userId });
    } catch (error) {
      logger.error('خطا در بازگرداندن نقش کاربر', { userId, error: error.message });
      throw error;
    }
  }

  /**
   * Get employee subsidy info for order
   * دریافت اطلاعات یارانه کارمند برای سفارش
   */
  async getSubsidyInfo(userId) {
    const emp = await Employee.findOne({
      where: { userId, status: 'active', canOrder: true },
      include: [{ model: Company, as: 'company' }]
    });

    if (!emp) {
      return null;
    }

    return {
      employeeId: emp.id,
      companyId: emp.companyId,
      subsidyPercentage: emp.subsidyPercentage,
      dailySubsidyLimit: emp.dailySubsidyLimit ? parseFloat(emp.dailySubsidyLimit) : null,
      monthlySubsidyLimit: emp.monthlySubsidyLimit ? parseFloat(emp.monthlySubsidyLimit) : null,
      canOrder: emp.canOrder
    };
  }

  format(e) {
    return {
      id: e.id,
      userId: e.userId,
      companyId: e.companyId,
      employeeCode: e.employeeCode,
      jobTitle: e.jobTitle,
      shiftId: e.shiftId,
      dailySubsidyLimit: e.dailySubsidyLimit ? parseFloat(e.dailySubsidyLimit) : null,
      monthlySubsidyLimit: e.monthlySubsidyLimit ? parseFloat(e.monthlySubsidyLimit) : null,
      subsidyPercentage: e.subsidyPercentage,
      canOrder: e.canOrder,
      status: e.status,
      joinedAt: e.joinedAt,
      createdAt: e.created_at,
      updatedAt: e.updated_at,
      company: e.company ? { id: e.company.id, name: e.company.name, logoUrl: e.company.logoUrl } : null,
      shift: e.shift ? { id: e.shift.id, name: e.shift.name, deliveryTime: e.shift.deliveryTime } : null
    };
  }
}

module.exports = new EmployeeService();
