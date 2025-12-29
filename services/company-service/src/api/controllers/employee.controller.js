const { employeeService } = require('../../services');
const { generateEmployeesExcel } = require('../../utils/excelHelper');

class EmployeeController {
  async create(req, res, next) {
    try {
      const emp = await employeeService.create(req.params.id, req.body);
      res.status(201).json({ success: true, data: emp, message: 'کارمند اضافه شد' });
    } catch (error) { next(error); }
  }

  async bulkCreate(req, res, next) {
    try {
      const result = await employeeService.bulkCreate(req.params.id, req.body.employees);
      res.status(201).json({ success: true, data: result, message: `${result.success.length} کارمند اضافه شد` });
    } catch (error) { next(error); }
  }

  async findByCompany(req, res, next) {
    try {
      const { page, limit, departmentId, status, search } = req.query;
      const result = await employeeService.findByCompany(req.params.id, { page: parseInt(page) || 1, limit: parseInt(limit) || 20, departmentId, status, search });
      res.json({ success: true, data: result.employees, pagination: result.pagination, message: 'لیست کارمندان' });
    } catch (error) { next(error); }
  }

  async findById(req, res, next) {
    try {
      const emp = await employeeService.findById(req.params.id, req.params.empId);
      res.json({ success: true, data: emp, message: 'اطلاعات کارمند' });
    } catch (error) { next(error); }
  }

  async update(req, res, next) {
    try {
      const emp = await employeeService.update(req.params.id, req.params.empId, req.body);
      res.json({ success: true, data: emp, message: 'کارمند ویرایش شد' });
    } catch (error) { next(error); }
  }

  async delete(req, res, next) {
    try {
      await employeeService.delete(req.params.id, req.params.empId);
      res.json({ success: true, data: null, message: 'کارمند حذف شد' });
    } catch (error) { next(error); }
  }

  async export(req, res, next) {
    try {
      const result = await employeeService.findByCompany(req.params.id, { limit: 10000 });
      const buffer = await generateEmployeesExcel(result.employees);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=employees.xlsx');
      res.send(buffer);
    } catch (error) { next(error); }
  }
}

module.exports = new EmployeeController();
