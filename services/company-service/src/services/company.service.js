const { Company } = require('../models');
const eventPublisher = require('../events/publisher');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

class CompanyService {
  async create(data) {
    if (data.registrationNumber) {
      const existing = await Company.findOne({ where: { registrationNumber: data.registrationNumber } });
      if (existing) throw { statusCode: 409, code: 'ERR_COMPANY_EXISTS', message: 'شرکتی با این شماره ثبت قبلاً وجود دارد' };
    }

    const company = await Company.create(data);
    await eventPublisher.publish('company.registered', { companyId: company.id, name: company.name, adminUserId: company.adminUserId });
    logger.info('شرکت جدید ثبت شد', { companyId: company.id });
    return this.format(company);
  }

  async findAll(options = {}) {
    const { page = 1, limit = 20, status, search } = options;
    const where = {};
    if (status) where.status = status;
    if (search) where[Op.or] = [{ name: { [Op.iLike]: `%${search}%` } }, { legalName: { [Op.iLike]: `%${search}%` } }];

    const { count, rows } = await Company.findAndCountAll({
      where, limit, offset: (page - 1) * limit, order: [['created_at', 'DESC']]
    });

    return {
      companies: rows.map(c => this.format(c)),
      pagination: { total: count, page, limit, totalPages: Math.ceil(count / limit) }
    };
  }

  async findById(id) {
    const company = await Company.findByPk(id);
    if (!company) throw { statusCode: 404, code: 'ERR_COMPANY_NOT_FOUND', message: 'شرکت یافت نشد' };
    return this.format(company);
  }

  async update(id, data) {
    const company = await Company.findByPk(id);
    if (!company) throw { statusCode: 404, code: 'ERR_COMPANY_NOT_FOUND', message: 'شرکت یافت نشد' };
    await company.update(data);
    logger.info('شرکت ویرایش شد', { companyId: id });
    return this.format(company);
  }

  async updateStatus(id, status, approvedBy = null) {
    const company = await Company.findByPk(id);
    if (!company) throw { statusCode: 404, code: 'ERR_COMPANY_NOT_FOUND', message: 'شرکت یافت نشد' };

    const updateData = { status };
    if (status === 'approved' || status === 'active') {
      updateData.approvedAt = new Date();
      updateData.approvedBy = approvedBy;
    }

    await company.update(updateData);

    const eventMap = { approved: 'company.approved', rejected: 'company.rejected', suspended: 'company.suspended' };
    if (eventMap[status]) await eventPublisher.publish(eventMap[status], { companyId: id, status });

    logger.info('وضعیت شرکت تغییر کرد', { companyId: id, status });
    return this.format(company);
  }

  async getDashboard(id) {
    const company = await Company.findByPk(id);
    if (!company) throw { statusCode: 404, code: 'ERR_COMPANY_NOT_FOUND', message: 'شرکت یافت نشد' };

    const { Department, Employee, DeliveryShift } = require('../models');
    const [departmentCount, employeeCount, shiftCount, activeEmployees] = await Promise.all([
      Department.count({ where: { companyId: id, isActive: true } }),
      Employee.count({ where: { companyId: id } }),
      DeliveryShift.count({ where: { companyId: id, isActive: true } }),
      Employee.count({ where: { companyId: id, status: 'active' } })
    ]);

    return {
      company: this.format(company),
      stats: { departments: departmentCount, totalEmployees: employeeCount, activeEmployees, shifts: shiftCount }
    };
  }

  format(c) {
    return {
      id: c.id, name: c.name, legalName: c.legalName, registrationNumber: c.registrationNumber,
      taxId: c.taxId, status: c.status, adminUserId: c.adminUserId, address: c.address, city: c.city,
      phone: c.phone, email: c.email, logoUrl: c.logoUrl, contractType: c.contractType,
      contractStartDate: c.contractStartDate, contractEndDate: c.contractEndDate,
      creditLimit: c.creditLimit ? parseFloat(c.creditLimit) : 0,
      approvedAt: c.approvedAt, approvedBy: c.approvedBy, createdAt: c.created_at, updatedAt: c.updated_at
    };
  }
}

module.exports = new CompanyService();
