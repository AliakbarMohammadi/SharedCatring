const { employeeService } = require('../../services');
const { generateEmployeesExcel } = require('../../utils/excelHelper');

class EmployeeController {
  /**
   * Find employees by company
   * GET /api/v1/companies/:id/employees
   */
  async findByCompany(req, res, next) {
    try {
      const { page, limit, status, search } = req.query;
      const result = await employeeService.findByCompany(req.params.id, {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
        status,
        search
      });
      res.json({
        success: true,
        data: result.employees,
        pagination: result.pagination,
        message: 'لیست کارمندان'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Find employee by ID
   * GET /api/v1/companies/:id/employees/:empId
   */
  async findById(req, res, next) {
    try {
      const emp = await employeeService.findById(req.params.id, req.params.empId);
      res.json({
        success: true,
        data: emp,
        message: 'اطلاعات کارمند'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update employee
   * PUT /api/v1/companies/:id/employees/:empId
   */
  async update(req, res, next) {
    try {
      const emp = await employeeService.update(req.params.id, req.params.empId, req.body);
      res.json({
        success: true,
        data: emp,
        message: 'کارمند ویرایش شد'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Remove employee from company (admin only)
   * DELETE /api/v1/companies/:id/employees/:empId
   * This reverts user role to personal_user
   */
  async remove(req, res, next) {
    try {
      const userRole = req.headers['x-user-role'];
      const removedBy = req.headers['x-user-id'];

      // Only super_admin or company_admin can remove employees
      if (!['super_admin', 'company_admin'].includes(userRole)) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'ERR_FORBIDDEN',
            message: 'فقط مدیر شرکت یا مدیر کل می‌تواند کارمند را حذف کند'
          }
        });
      }

      const result = await employeeService.remove(req.params.id, req.params.empId, removedBy);
      res.json({
        success: true,
        data: result,
        message: 'کارمند از شرکت حذف شد'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Export employees to Excel
   * GET /api/v1/companies/:id/employees/export
   */
  async export(req, res, next) {
    try {
      const result = await employeeService.findByCompany(req.params.id, { limit: 10000 });
      const buffer = await generateEmployeesExcel(result.employees);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=employees.xlsx');
      res.send(buffer);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new EmployeeController();
