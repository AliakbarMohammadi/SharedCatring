const { DeliveryShift, Company } = require('../models');
const logger = require('../utils/logger');

class ShiftService {
  async create(companyId, data) {
    const company = await Company.findByPk(companyId);
    if (!company) throw { statusCode: 404, code: 'ERR_COMPANY_NOT_FOUND', message: 'شرکت یافت نشد' };

    const shift = await DeliveryShift.create({ ...data, companyId });
    logger.info('شیفت تحویل ایجاد شد', { companyId, shiftId: shift.id });
    return this.format(shift);
  }

  async findByCompany(companyId) {
    const shifts = await DeliveryShift.findAll({ where: { companyId }, order: [['delivery_time', 'ASC']] });
    return shifts.map(s => this.format(s));
  }

  async update(companyId, shiftId, data) {
    const shift = await DeliveryShift.findOne({ where: { id: shiftId, companyId } });
    if (!shift) throw { statusCode: 404, code: 'ERR_SHIFT_NOT_FOUND', message: 'شیفت یافت نشد' };

    await shift.update(data);
    logger.info('شیفت ویرایش شد', { shiftId });
    return this.format(shift);
  }

  format(s) {
    return {
      id: s.id, companyId: s.companyId, name: s.name, deliveryTime: s.deliveryTime,
      orderDeadline: s.orderDeadline, isActive: s.isActive, createdAt: s.created_at
    };
  }
}

module.exports = new ShiftService();
