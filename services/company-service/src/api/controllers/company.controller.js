const { companyService } = require('../../services');

class CompanyController {
  async getStats(req, res, next) {
    try {
      const stats = await companyService.getStats();
      res.json({ success: true, data: stats, message: 'آمار شرکت‌ها با موفقیت دریافت شد' });
    } catch (error) { next(error); }
  }

  /**
   * Discover companies (for personal_user to find companies to join)
   * GET /api/v1/companies/discover
   */
  async discoverCompanies(req, res, next) {
    try {
      const { page, limit, search } = req.query;
      // Only return active companies with basic info
      const result = await companyService.findAll({
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
        status: 'active',
        search
      });

      // Return only public info
      const publicCompanies = result.companies.map(c => ({
        id: c.id,
        name: c.name,
        logoUrl: c.logoUrl,
        city: c.city
      }));

      res.json({
        success: true,
        data: publicCompanies,
        pagination: result.pagination,
        message: 'لیست شرکت‌ها'
      });
    } catch (error) { next(error); }
  }

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
      // Double-check: Only super_admin can change company status
      const userRole = req.headers['x-user-role'];
      if (userRole !== 'super_admin') {
        return res.status(403).json({
          success: false,
          error: {
            code: 'ERR_FORBIDDEN',
            message: 'فقط مدیر کل می‌تواند وضعیت شرکت را تغییر دهد',
            details: []
          }
        });
      }

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
