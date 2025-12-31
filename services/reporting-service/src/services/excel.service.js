const ExcelJS = require('exceljs');
const { toJalali, formatPrice, formatNumber, getCurrentJalaliDate } = require('../utils/helpers');
const logger = require('../utils/logger');

class ExcelService {
  async generateDailyReport(data) {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'سیستم کترینگ';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet('گزارش روزانه', {
      views: [{ rightToLeft: true }]
    });

    // Header
    sheet.mergeCells('A1:F1');
    sheet.getCell('A1').value = `گزارش سفارشات روزانه - ${data.dateJalali}`;
    sheet.getCell('A1').font = { bold: true, size: 16 };
    sheet.getCell('A1').alignment = { horizontal: 'center' };

    // Summary section
    sheet.addRow([]);
    sheet.addRow(['خلاصه گزارش']);
    sheet.getRow(3).font = { bold: true };

    const summaryData = [
      ['کل سفارشات', data.summary.totalOrders.formatted],
      ['سفارشات تکمیل شده', data.summary.completedOrders.formatted],
      ['سفارشات لغو شده', data.summary.cancelledOrders.formatted],
      ['درآمد کل', data.summary.totalRevenue.formatted],
      ['میانگین سفارش', data.summary.avgOrderValue.formatted],
      ['مشتریان یکتا', data.summary.uniqueCustomers.formatted]
    ];

    summaryData.forEach(row => sheet.addRow(row));

    // Style columns
    sheet.columns = [
      { width: 25 },
      { width: 20 },
      { width: 20 },
      { width: 20 },
      { width: 20 },
      { width: 20 }
    ];

    return workbook;
  }

  async generateMonthlyReport(data) {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'سیستم کترینگ';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet('گزارش ماهانه', {
      views: [{ rightToLeft: true }]
    });

    // Header
    sheet.mergeCells('A1:E1');
    sheet.getCell('A1').value = `گزارش سفارشات ماهانه - ${data.period}`;
    sheet.getCell('A1').font = { bold: true, size: 16 };
    sheet.getCell('A1').alignment = { horizontal: 'center' };

    // Summary
    sheet.addRow([]);
    sheet.addRow(['خلاصه ماه']);
    sheet.getRow(3).font = { bold: true };
    sheet.addRow(['کل سفارشات', data.summary.totalOrders.formatted]);
    sheet.addRow(['درآمد کل', data.summary.totalRevenue.formatted]);
    sheet.addRow(['میانگین روزانه', data.summary.avgDailyOrders.formatted]);

    // Daily data header
    sheet.addRow([]);
    sheet.addRow(['تاریخ', 'تعداد سفارش', 'درآمد', 'تعداد مشتری']);
    const headerRow = sheet.lastRow;
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    // Daily data
    data.dailyData.forEach(day => {
      sheet.addRow([
        day.dateJalali,
        day.orders,
        day.revenueFormatted,
        day.customers
      ]);
    });

    // Style columns
    sheet.columns = [
      { width: 15 },
      { width: 15 },
      { width: 20 },
      { width: 15 }
    ];

    return workbook;
  }

  async generateRevenueReport(data) {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'سیستم کترینگ';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet('گزارش درآمد', {
      views: [{ rightToLeft: true }]
    });

    // Header
    sheet.mergeCells('A1:D1');
    sheet.getCell('A1').value = `گزارش درآمد - ${data.period.startJalali} تا ${data.period.endJalali}`;
    sheet.getCell('A1').font = { bold: true, size: 16 };
    sheet.getCell('A1').alignment = { horizontal: 'center' };

    // Summary
    sheet.addRow([]);
    sheet.addRow(['خلاصه']);
    sheet.getRow(3).font = { bold: true };
    sheet.addRow(['درآمد کل', data.summary.totalRevenue.formatted]);
    sheet.addRow(['تعداد سفارشات', data.summary.totalOrders.formatted]);
    sheet.addRow(['میانگین سفارش', data.summary.avgOrderValue.formatted]);

    // Data header
    sheet.addRow([]);
    sheet.addRow(['دوره', 'درآمد', 'تعداد سفارش', 'میانگین']);
    const headerRow = sheet.lastRow;
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    // Data rows
    data.data.forEach(item => {
      sheet.addRow([
        item.period,
        item.revenueFormatted,
        item.orderCount,
        formatPrice(item.avgOrderValue)
      ]);
    });

    sheet.columns = [
      { width: 15 },
      { width: 20 },
      { width: 15 },
      { width: 20 }
    ];

    return workbook;
  }

  async generateCompanyReport(data) {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'سیستم کترینگ';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet('گزارش مصرف شرکت', {
      views: [{ rightToLeft: true }]
    });

    // Header
    sheet.mergeCells('A1:F1');
    sheet.getCell('A1').value = `گزارش مصرف شرکت - ${data.period.startJalali} تا ${data.period.endJalali}`;
    sheet.getCell('A1').font = { bold: true, size: 16 };
    sheet.getCell('A1').alignment = { horizontal: 'center' };

    // Summary
    sheet.addRow([]);
    sheet.addRow(['خلاصه']);
    sheet.getRow(3).font = { bold: true };
    sheet.addRow(['کل سفارشات', data.summary.totalOrders.formatted]);
    sheet.addRow(['مبلغ کل', data.summary.totalAmount.formatted]);
    sheet.addRow(['سهم شرکت', data.summary.companyPaid.formatted]);
    sheet.addRow(['سهم کارمندان', data.summary.employeePaid.formatted]);
    sheet.addRow(['درصد یارانه', data.summary.subsidyPercentage.formatted]);

    // Data header
    sheet.addRow([]);
    sheet.addRow(['تاریخ', 'تعداد سفارش', 'مبلغ کل', 'سهم شرکت', 'سهم کارمند', 'تعداد کارمند']);
    const headerRow = sheet.lastRow;
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    // Data rows
    data.dailyData.forEach(day => {
      sheet.addRow([
        day.dateJalali,
        day.orderCount,
        day.totalAmountFormatted,
        formatPrice(day.companyPaid),
        formatPrice(day.employeePaid),
        day.employeeCount
      ]);
    });

    sheet.columns = [
      { width: 15 },
      { width: 12 },
      { width: 18 },
      { width: 18 },
      { width: 18 },
      { width: 12 }
    ];

    return workbook;
  }

  async generatePopularItemsReport(data) {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'سیستم کترینگ';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet('غذاهای پرطرفدار', {
      views: [{ rightToLeft: true }]
    });

    // Header
    sheet.mergeCells('A1:F1');
    sheet.getCell('A1').value = `غذاهای پرطرفدار - ${data.period.startJalali} تا ${data.period.endJalali}`;
    sheet.getCell('A1').font = { bold: true, size: 16 };
    sheet.getCell('A1').alignment = { horizontal: 'center' };

    // Data header
    sheet.addRow([]);
    sheet.addRow(['رتبه', 'نام غذا', 'تعداد سفارش', 'تعداد فروش', 'درآمد کل', 'قیمت میانگین']);
    const headerRow = sheet.lastRow;
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    // Data rows
    data.items.forEach(item => {
      sheet.addRow([
        item.rank,
        item.foodName,
        item.orderCount,
        item.totalQuantity,
        item.totalRevenueFormatted,
        item.avgPriceFormatted
      ]);
    });

    sheet.columns = [
      { width: 8 },
      { width: 25 },
      { width: 12 },
      { width: 12 },
      { width: 18 },
      { width: 18 }
    ];

    return workbook;
  }
}

module.exports = new ExcelService();
