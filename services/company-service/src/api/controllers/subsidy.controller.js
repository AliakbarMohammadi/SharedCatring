const { subsidyService } = require('../../services');

class SubsidyController {
  async create(req, res, next) {
    try {
      console.log('=== SUBSIDY CREATE ===');
      console.log('req.body:', JSON.stringify(req.body));
      console.log('req.params:', JSON.stringify(req.params));
      const rule = await subsidyService.create(req.params.id, req.body);
      res.status(201).json({ success: true, data: rule, message: 'قانون یارانه ایجاد شد' });
    } catch (error) { next(error); }
  }

  async findByCompany(req, res, next) {
    try {
      const rules = await subsidyService.findByCompany(req.params.id);
      res.json({ success: true, data: rules, message: 'لیست قوانین یارانه' });
    } catch (error) { next(error); }
  }

  async update(req, res, next) {
    try {
      const rule = await subsidyService.update(req.params.id, req.params.ruleId, req.body);
      res.json({ success: true, data: rule, message: 'قانون یارانه ویرایش شد' });
    } catch (error) { next(error); }
  }

  /**
   * Calculate subsidy for an order (Internal API)
   */
  async calculate(req, res, next) {
    try {
      const { userId, orderAmount, mealType } = req.body;
      const result = await subsidyService.calculateSubsidy(
        req.params.id,
        userId,
        orderAmount,
        mealType
      );
      res.json({ success: true, data: result, message: 'یارانه محاسبه شد' });
    } catch (error) { next(error); }
  }

  /**
   * Get employee info for ordering
   */
  async getEmployeeInfo(req, res, next) {
    try {
      const { userId } = req.query;
      const result = await subsidyService.getEmployeeInfo(req.params.id, userId);
      if (!result) {
        return res.status(404).json({ 
          success: false, 
          error: { code: 'ERR_EMPLOYEE_NOT_FOUND', message: 'کارمند یافت نشد' }
        });
      }
      res.json({ success: true, data: result });
    } catch (error) { next(error); }
  }
}

module.exports = new SubsidyController();
