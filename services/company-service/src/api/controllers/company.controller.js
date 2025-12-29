const { companyService } = require('../../services');

class CompanyController {
  async create(req, res, next) {
    try {
      const company = await companyService.create(req.body);
      res.status(201).json({ success: true, data: company, message: 'شرکت با موفقیت ثبت شد' });
    } catch (error) { next(error); }
  }

  async findAll(req, res, next) {
    try {
      const { page, limit, status, search } = req.query;
      const result = await companyService.findAll({ page: parseInt(page) || 1, limit: parseInt(limit) || 20, status, search });
      res.json({ success: true, data: result.companies, pagination: result.pagination, message: 'لیست شرکت‌ها' });
    } catch (error) { next(error); }
  }

  async findById(req, res, next) {
    try {
      const company = await companyService.findById(req.params.id);
      res.json({ success: true, data: company, message: 'اطلاعات شرکت' });
    } catch (error) { next(error); }
  }

  async update(req, res, next) {
    try {
      const company = await companyService.update(req.params.id, req.body);
      res.json({ success: true, data: company, message: 'شرکت با موفقیت ویرایش شد' });
    } catch (error) { next(error); }
  }

  async updateStatus(req, res, next) {
    try {
      const company = await companyService.updateStatus(req.params.id, req.body.status, req.userId);
      res.json({ success: true, data: company, message: 'وضعیت شرکت تغییر کرد' });
    } catch (error) { next(error); }
  }

  async getDashboard(req, res, next) {
    try {
      const dashboard = await companyService.getDashboard(req.params.id);
      res.json({ success: true, data: dashboard, message: 'داشبورد شرکت' });
    } catch (error) { next(error); }
  }
}

module.exports = new CompanyController();
