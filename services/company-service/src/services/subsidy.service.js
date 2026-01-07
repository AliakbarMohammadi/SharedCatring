const { SubsidyRule, Company, Employee } = require('../models');
const logger = require('../utils/logger');

class SubsidyService {
  /**
   * Map API request fields to database fields
   * تبدیل فیلدهای درخواست به فیلدهای دیتابیس
   */
  mapRequestToModel(data) {
    const mapped = {};
    
    // Map type → ruleType
    if (data.type !== undefined) {
      mapped.ruleType = data.type;
    }
    if (data.ruleType !== undefined) {
      mapped.ruleType = data.ruleType;
    }
    
    // Map value based on type
    if (data.value !== undefined) {
      if (data.type === 'percentage' || data.ruleType === 'percentage') {
        mapped.percentage = data.value;
      } else if (data.type === 'fixed' || data.ruleType === 'fixed') {
        mapped.fixedAmount = data.value;
      }
    }
    
    // Direct mappings if provided
    if (data.percentage !== undefined) mapped.percentage = data.percentage;
    if (data.fixedAmount !== undefined) mapped.fixedAmount = data.fixedAmount;
    
    // Map mealTypes → applicableMeals
    if (data.mealTypes !== undefined) {
      mapped.applicableMeals = data.mealTypes;
    }
    if (data.applicableMeals !== undefined) {
      mapped.applicableMeals = data.applicableMeals;
    }
    
    // Map maxAmount → maxPerMeal
    if (data.maxAmount !== undefined) {
      mapped.maxPerMeal = data.maxAmount;
    }
    if (data.maxPerMeal !== undefined) {
      mapped.maxPerMeal = data.maxPerMeal;
    }
    
    // Pass through other fields
    if (data.name !== undefined) mapped.name = data.name;
    if (data.maxPerDay !== undefined) mapped.maxPerDay = data.maxPerDay;
    if (data.maxPerMonth !== undefined) mapped.maxPerMonth = data.maxPerMonth;
    if (data.startDate !== undefined) mapped.startDate = data.startDate;
    if (data.endDate !== undefined) mapped.endDate = data.endDate;
    if (data.isActive !== undefined) mapped.isActive = data.isActive;
    if (data.priority !== undefined) mapped.priority = data.priority;
    
    return mapped;
  }

  async create(companyId, data) {
    const company = await Company.findByPk(companyId);
    if (!company) throw { statusCode: 404, code: 'ERR_COMPANY_NOT_FOUND', message: 'شرکت یافت نشد' };

    logger.info('DEBUG Subsidy create - raw data received', JSON.stringify(data));
    const mappedData = this.mapRequestToModel(data);
    logger.info('DEBUG Subsidy create - after mapping', JSON.stringify(mappedData));
    
    const rule = await SubsidyRule.create({ ...mappedData, companyId });
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

    const mappedData = this.mapRequestToModel(data);
    await rule.update(mappedData);
    logger.info('قانون یارانه ویرایش شد', { ruleId });
    return this.format(rule);
  }

  /**
   * Calculate subsidy for an order
   * محاسبه یارانه برای یک سفارش
   */
  async calculateSubsidy(companyId, userId, orderAmount, mealType = 'lunch') {
    // Find employee
    const employee = await Employee.findOne({ where: { userId, companyId } });
    if (!employee) {
      return { subsidyAmount: 0, reason: 'کاربر کارمند این شرکت نیست' };
    }

    if (!employee.canOrder) {
      return { subsidyAmount: 0, reason: 'کارمند مجاز به سفارش نیست' };
    }

    // Get active subsidy rules for this company
    const rules = await SubsidyRule.findAll({
      where: { 
        companyId, 
        isActive: true 
      },
      order: [['priority', 'DESC']]
    });

    if (rules.length === 0) {
      return { subsidyAmount: 0, reason: 'قانون یارانه فعالی برای این شرکت وجود ندارد' };
    }

    // Find applicable rule
    const today = new Date();
    let applicableRule = null;

    for (const rule of rules) {
      // Check date range
      if (rule.startDate && new Date(rule.startDate) > today) continue;
      if (rule.endDate && new Date(rule.endDate) < today) continue;

      // Check meal type
      if (rule.applicableMeals && rule.applicableMeals.length > 0) {
        if (!rule.applicableMeals.includes(mealType)) continue;
      }

      applicableRule = rule;
      break; // Use first matching rule (highest priority)
    }

    if (!applicableRule) {
      return { subsidyAmount: 0, reason: 'قانون یارانه مناسبی یافت نشد' };
    }

    // Calculate subsidy amount
    let subsidyAmount = 0;

    if (applicableRule.ruleType === 'percentage') {
      subsidyAmount = (orderAmount * applicableRule.percentage) / 100;
    } else if (applicableRule.ruleType === 'fixed') {
      subsidyAmount = parseFloat(applicableRule.fixedAmount) || 0;
    }

    // Apply limits
    if (applicableRule.maxPerMeal && subsidyAmount > parseFloat(applicableRule.maxPerMeal)) {
      subsidyAmount = parseFloat(applicableRule.maxPerMeal);
    }

    // Check employee daily limit
    if (employee.dailySubsidyLimit && subsidyAmount > parseFloat(employee.dailySubsidyLimit)) {
      subsidyAmount = parseFloat(employee.dailySubsidyLimit);
    }

    // Ensure subsidy doesn't exceed order amount
    if (subsidyAmount > orderAmount) {
      subsidyAmount = orderAmount;
    }

    logger.info('یارانه محاسبه شد', {
      companyId,
      userId,
      orderAmount,
      subsidyAmount,
      ruleId: applicableRule.id
    });

    return {
      subsidyAmount: Math.round(subsidyAmount),
      ruleId: applicableRule.id,
      ruleName: applicableRule.name,
      employeeId: employee.id
    };
  }

  /**
   * Get employee info for order
   */
  async getEmployeeInfo(companyId, userId) {
    const employee = await Employee.findOne({ where: { userId, companyId } });
    if (!employee) return null;

    return {
      employeeId: employee.id,
      canOrder: employee.canOrder,
      dailySubsidyLimit: employee.dailySubsidyLimit ? parseFloat(employee.dailySubsidyLimit) : null,
      monthlySubsidyLimit: employee.monthlySubsidyLimit ? parseFloat(employee.monthlySubsidyLimit) : null,
      subsidyPercentage: employee.subsidyPercentage
    };
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
