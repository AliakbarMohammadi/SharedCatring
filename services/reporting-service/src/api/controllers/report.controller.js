const reportService = require('../../services/report.service');
const excelService = require('../../services/excel.service');
const logger = require('../../utils/logger');

class ReportController {
  /**
   * GET /api/v1/reports/dashboard
   * داشبورد مدیریتی
   */
  async getDashboard(req, res, next) {
    try {
      const data = await reportService.getDashboard();
      
      res.json({
        success: true,
        data,
        message: 'داشبورد با موفقیت دریافت شد'
      });
    } catch (error) {
      logger.error('خطا در دریافت داشبورد', { error: error.message });
      next(error);
    }
  }

  /**
   * GET /api/v1/reports/orders/daily
   * گزارش سفارشات روزانه
   */
  async getDailyReport(req, res, next) {
    try {
      const { date } = req.query;
      const data = await reportService.getDailyReport(date);
      
      res.json({
        success: true,
        data,
        message: 'گزارش روزانه با موفقیت دریافت شد'
      });
    } catch (error) {
      logger.error('خطا در دریافت گزارش روزانه', { error: error.message });
      next(error);
    }
  }

  /**
   * GET /api/v1/reports/orders/monthly
   * گزارش سفارشات ماهانه
   */
  async getMonthlyReport(req, res, next) {
    try {
      const { year, month } = req.query;
      const data = await reportService.getMonthlyReport(
        year ? parseInt(year) : undefined,
        month ? parseInt(month) : undefined
      );
      
      res.json({
        success: true,
        data,
        message: 'گزارش ماهانه با موفقیت دریافت شد'
      });
    } catch (error) {
      logger.error('خطا در دریافت گزارش ماهانه', { error: error.message });
      next(error);
    }
  }

  /**
   * GET /api/v1/reports/revenue
   * گزارش درآمد
   */
  async getRevenueReport(req, res, next) {
    try {
      const { startDate, endDate, groupBy } = req.query;
      const data = await reportService.getRevenueReport({
        startDate,
        endDate,
        groupBy
      });
      
      res.json({
        success: true,
        data,
        message: 'گزارش درآمد با موفقیت دریافت شد'
      });
    } catch (error) {
      logger.error('خطا در دریافت گزارش درآمد', { error: error.message });
      next(error);
    }
  }

  /**
   * GET /api/v1/reports/company/:id/consumption
   * گزارش مصرف شرکت
   */
  async getCompanyConsumption(req, res, next) {
    try {
      const { id: companyId } = req.params;
      const { startDate, endDate } = req.query;
      
      const data = await reportService.getCompanyConsumption(companyId, {
        startDate,
        endDate
      });
      
      res.json({
        success: true,
        data,
        message: 'گزارش مصرف شرکت با موفقیت دریافت شد'
      });
    } catch (error) {
      logger.error('خطا در دریافت گزارش مصرف شرکت', { error: error.message });
      next(error);
    }
  }

  /**
   * GET /api/v1/reports/popular-items
   * غذاهای پرطرفدار
   */
  async getPopularItems(req, res, next) {
    try {
      const { limit, startDate, endDate } = req.query;
      const data = await reportService.getPopularItems({
        limit: limit ? parseInt(limit) : 10,
        startDate,
        endDate
      });
      
      res.json({
        success: true,
        data,
        message: 'غذاهای پرطرفدار با موفقیت دریافت شد'
      });
    } catch (error) {
      logger.error('خطا در دریافت غذاهای پرطرفدار', { error: error.message });
      next(error);
    }
  }

  /**
   * GET /api/v1/reports/export
   * خروجی Excel
   */
  async exportReport(req, res, next) {
    try {
      const { type, date, year, month, startDate, endDate, companyId, limit } = req.query;
      
      let data;
      let workbook;
      let filename;

      switch (type) {
        case 'daily':
          data = await reportService.getDailyReport(date);
          workbook = await excelService.generateDailyReport(data);
          filename = `گزارش-روزانه-${data.dateJalali}.xlsx`;
          break;
          
        case 'monthly':
          data = await reportService.getMonthlyReport(
            year ? parseInt(year) : undefined,
            month ? parseInt(month) : undefined
          );
          workbook = await excelService.generateMonthlyReport(data);
          filename = `گزارش-ماهانه-${data.period}.xlsx`;
          break;
          
        case 'revenue':
          data = await reportService.getRevenueReport({ startDate, endDate });
          workbook = await excelService.generateRevenueReport(data);
          filename = `گزارش-درآمد-${data.period.startJalali}-${data.period.endJalali}.xlsx`;
          break;
          
        case 'company':
          if (!companyId) {
            return res.status(400).json({
              success: false,
              error: {
                code: 'ERR_VALIDATION',
                message: 'شناسه شرکت الزامی است',
                details: [],
                timestamp: new Date().toISOString()
              }
            });
          }
          data = await reportService.getCompanyConsumption(companyId, { startDate, endDate });
          workbook = await excelService.generateCompanyReport(data);
          filename = `گزارش-مصرف-شرکت-${data.period.startJalali}-${data.period.endJalali}.xlsx`;
          break;
          
        case 'popular':
          data = await reportService.getPopularItems({
            limit: limit ? parseInt(limit) : 10,
            startDate,
            endDate
          });
          workbook = await excelService.generatePopularItemsReport(data);
          filename = `غذاهای-پرطرفدار-${data.period.startJalali}-${data.period.endJalali}.xlsx`;
          break;
          
        default:
          return res.status(400).json({
            success: false,
            error: {
              code: 'ERR_VALIDATION',
              message: 'نوع گزارش نامعتبر است',
              details: [],
              timestamp: new Date().toISOString()
            }
          });
      }

      // Set headers for Excel download
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`);
      
      // Write workbook to response
      await workbook.xlsx.write(res);
      res.end();
      
      logger.info('گزارش Excel صادر شد', { type, filename });
    } catch (error) {
      logger.error('خطا در صدور گزارش Excel', { error: error.message });
      next(error);
    }
  }
}

module.exports = new ReportController();
