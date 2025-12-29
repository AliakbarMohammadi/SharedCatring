const { subsidyService } = require('../../services');

class SubsidyController {
  async create(req, res, next) {
    try {
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
}

module.exports = new SubsidyController();
