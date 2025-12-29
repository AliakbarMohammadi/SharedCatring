const { departmentService } = require('../../services');

class DepartmentController {
  async create(req, res, next) {
    try {
      const dept = await departmentService.create(req.params.id, req.body);
      res.status(201).json({ success: true, data: dept, message: 'دپارتمان ایجاد شد' });
    } catch (error) { next(error); }
  }

  async findByCompany(req, res, next) {
    try {
      const depts = await departmentService.findByCompany(req.params.id);
      res.json({ success: true, data: depts, message: 'لیست دپارتمان‌ها' });
    } catch (error) { next(error); }
  }

  async update(req, res, next) {
    try {
      const dept = await departmentService.update(req.params.id, req.params.deptId, req.body);
      res.json({ success: true, data: dept, message: 'دپارتمان ویرایش شد' });
    } catch (error) { next(error); }
  }

  async delete(req, res, next) {
    try {
      await departmentService.delete(req.params.id, req.params.deptId);
      res.json({ success: true, data: null, message: 'دپارتمان حذف شد' });
    } catch (error) { next(error); }
  }
}

module.exports = new DepartmentController();
