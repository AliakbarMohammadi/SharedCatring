const { SubsidyRule, Company } = require('../models');
const logger = require('../utils/logger');

class SubsidyService {
  async create(companyId, data) {
    const company = await Company.findByPk(companyId);
    if (!company) throw { statusCode: 404, code: 'ERR_COMPANY_NOT_FOUND', message: 'شرکت یافت نشد' };

    const rule = await SubsidyRule.create({ ...data, companyId });
    logger.info('قانون یارانه ایجاد شد', { companyId, ruleId: rule.id });
    return this.format(rule);
  }

  async findByCompany(companyId) {
    const rules = await SubsidyRule.findAll({ where: { companyId }, order: [['priority', 'DESC'], ['created_at', 'DESC']] });
    return rules.map(r => this.format(r));
  }

  async update(companyId, ruleId, data) {
    const rule = await SubsidyRule.findOne({ where: { id: ruleId, companyId } });
    if (!rule) throw { statusCode: 404, code: 'ERR_RULE_NOT_FOUND', message: 'قانون یارانه یافت نشد' };

    await rule.update(data);
    logger.info('قانون یارانه ویرایش شد', { ruleId });
    return this.format(rule);
  }

  format(r) {
    return {
      id: r.id, companyId: r.companyId, name: r.name, ruleType: r.ruleType, percentage: r.percentage,
      fixedAmount: r.fixedAmount ? parseFloat(r.fixedAmount) : null,
      maxPerMeal: r.maxPerMeal ? parseFloat(r.maxPerMeal) : null,
      maxPerDay: r.maxPerDay ? parseFloat(r.maxPerDay) : null,
      maxPerMonth: r.maxPerMonth ? parseFloat(r.maxPerMonth) : null,
      applicableMeals: r.applicableMeals, startDate: r.startDate, endDate: r.endDate,
      isActive: r.isActive, priority: r.priority, createdAt: r.created_at
    };
  }
}

module.exports = new SubsidyService();
