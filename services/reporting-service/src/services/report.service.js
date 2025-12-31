const reportRepository = require('../repositories/report.repository');
const redisClient = require('../config/redis');
const config = require('../config');
const { toJalali, toJalaliDateTime, formatPrice, formatNumber, getCurrentJalaliDate, getJalaliMonthName } = require('../utils/helpers');
const logger = require('../utils/logger');

class ReportService {
  // Dashboard metrics
  async getDashboard() {
    const cacheKey = 'reports:dashboard';
    
    // Try cache first
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      logger.debug('داشبورد از کش خوانده شد');
      return cached;
    }

    const metrics = await reportRepository.getDashboardMetrics();
    const jalaliDate = getCurrentJalaliDate();

    const dashboard = {
      date: jalaliDate.formatted,
      dateFull: `${jalaliDate.day} ${jalaliDate.monthName} ${jalaliDate.year}`,
      metrics: {
        todayOrders: {
          value: metrics.today_orders || 0,
          formatted: formatNumber(metrics.today_orders || 0),
          label: 'سفارشات امروز'
        },
        todayRevenue: {
          value: parseFloat(metrics.today_revenue) || 0,
          formatted: formatPrice(metrics.today_revenue || 0),
          label: 'درآمد امروز'
        },
        pendingOrders: {
          value: metrics.pending_orders || 0,
          formatted: formatNumber(metrics.pending_orders || 0),
          label: 'سفارشات در انتظار'
        },
        activeUsers: {
          value: metrics.active_users || 0,
          formatted: formatNumber(metrics.active_users || 0),
          label: 'کاربران فعال (۷ روز)'
        }
      },
      comparison: {
        ordersChange: this.calculateChange(metrics.today_orders, metrics.yesterday_orders),
        revenueChange: this.calculateChange(metrics.today_revenue, metrics.yesterday_revenue)
      },
      generatedAt: new Date().toISOString(),
      generatedAtJalali: toJalaliDateTime(new Date())
    };

    // Cache the result
    await redisClient.set(cacheKey, dashboard, config.cache.ttl.dashboard);

    return dashboard;
  }

  // Daily orders report
  async getDailyReport(date) {
    const dateStr = date || new Date().toISOString().split('T')[0];
    const cacheKey = `reports:daily:${dateStr}`;

    const cached = await redisClient.get(cacheKey);
    if (cached) {
      logger.debug('گزارش روزانه از کش خوانده شد', { date: dateStr });
      return cached;
    }

    const data = await reportRepository.getDailyOrdersReport(dateStr);
    const report = data[0] || {};

    const result = {
      date: dateStr,
      dateJalali: toJalali(dateStr),
      summary: {
        totalOrders: {
          value: report.total_orders || 0,
          formatted: formatNumber(report.total_orders || 0),
          label: 'کل سفارشات'
        },
        completedOrders: {
          value: report.completed_orders || 0,
          formatted: formatNumber(report.completed_orders || 0),
          label: 'تکمیل شده'
        },
        cancelledOrders: {
          value: report.cancelled_orders || 0,
          formatted: formatNumber(report.cancelled_orders || 0),
          label: 'لغو شده'
        },
        totalRevenue: {
          value: parseFloat(report.total_revenue) || 0,
          formatted: formatPrice(report.total_revenue || 0),
          label: 'درآمد کل'
        },
        avgOrderValue: {
          value: parseFloat(report.avg_order_value) || 0,
          formatted: formatPrice(report.avg_order_value || 0),
          label: 'میانگین سفارش'
        },
        uniqueCustomers: {
          value: report.unique_customers || 0,
          formatted: formatNumber(report.unique_customers || 0),
          label: 'مشتریان یکتا'
        }
      },
      generatedAt: new Date().toISOString()
    };

    await redisClient.set(cacheKey, result, config.cache.ttl.daily);

    return result;
  }

  // Monthly orders report
  async getMonthlyReport(year, month) {
    const jalaliDate = getCurrentJalaliDate();
    const reportYear = year || jalaliDate.year;
    const reportMonth = month || jalaliDate.month;
    
    const cacheKey = `reports:monthly:${reportYear}-${reportMonth}`;

    const cached = await redisClient.get(cacheKey);
    if (cached) {
      logger.debug('گزارش ماهانه از کش خوانده شد', { year: reportYear, month: reportMonth });
      return cached;
    }

    const data = await reportRepository.getMonthlyOrdersReport(reportYear, reportMonth);

    // Calculate totals
    const totals = data.reduce((acc, day) => ({
      totalOrders: acc.totalOrders + (parseInt(day.total_orders) || 0),
      totalRevenue: acc.totalRevenue + (parseFloat(day.total_revenue) || 0),
      uniqueCustomers: acc.uniqueCustomers + (parseInt(day.unique_customers) || 0)
    }), { totalOrders: 0, totalRevenue: 0, uniqueCustomers: 0 });

    const result = {
      year: reportYear,
      month: reportMonth,
      monthName: getJalaliMonthName(reportMonth),
      period: `${getJalaliMonthName(reportMonth)} ${reportYear}`,
      summary: {
        totalOrders: {
          value: totals.totalOrders,
          formatted: formatNumber(totals.totalOrders),
          label: 'کل سفارشات'
        },
        totalRevenue: {
          value: totals.totalRevenue,
          formatted: formatPrice(totals.totalRevenue),
          label: 'درآمد کل'
        },
        avgDailyOrders: {
          value: Math.round(totals.totalOrders / (data.length || 1)),
          formatted: formatNumber(Math.round(totals.totalOrders / (data.length || 1))),
          label: 'میانگین روزانه'
        }
      },
      dailyData: data.map(day => ({
        date: day.date,
        dateJalali: toJalali(day.date),
        orders: parseInt(day.total_orders) || 0,
        revenue: parseFloat(day.total_revenue) || 0,
        revenueFormatted: formatPrice(day.total_revenue || 0),
        customers: parseInt(day.unique_customers) || 0
      })),
      generatedAt: new Date().toISOString()
    };

    await redisClient.set(cacheKey, result, config.cache.ttl.monthly);

    return result;
  }

  // Revenue report
  async getRevenueReport(options = {}) {
    const { startDate, endDate, groupBy = 'day' } = options;
    
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const end = endDate || new Date().toISOString();
    
    const cacheKey = `reports:revenue:${start}:${end}:${groupBy}`;

    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return cached;
    }

    const data = await reportRepository.getRevenueReport(start, end, groupBy);

    const totalRevenue = data.reduce((sum, item) => sum + (parseFloat(item.revenue) || 0), 0);
    const totalOrders = data.reduce((sum, item) => sum + (parseInt(item.order_count) || 0), 0);

    const result = {
      period: {
        start,
        end,
        startJalali: toJalali(start),
        endJalali: toJalali(end),
        groupBy
      },
      summary: {
        totalRevenue: {
          value: totalRevenue,
          formatted: formatPrice(totalRevenue),
          label: 'درآمد کل'
        },
        totalOrders: {
          value: totalOrders,
          formatted: formatNumber(totalOrders),
          label: 'تعداد سفارشات'
        },
        avgOrderValue: {
          value: totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0,
          formatted: formatPrice(totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0),
          label: 'میانگین سفارش'
        }
      },
      data: data.map(item => ({
        period: item.period,
        revenue: parseFloat(item.revenue) || 0,
        revenueFormatted: formatPrice(item.revenue || 0),
        orderCount: parseInt(item.order_count) || 0,
        avgOrderValue: parseFloat(item.avg_order_value) || 0
      })),
      generatedAt: new Date().toISOString()
    };

    await redisClient.set(cacheKey, result, config.cache.ttl.daily);

    return result;
  }

  // Company consumption report
  async getCompanyConsumption(companyId, options = {}) {
    const { startDate, endDate } = options;
    
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const end = endDate || new Date().toISOString();

    const cacheKey = `reports:company:${companyId}:${start}:${end}`;

    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return cached;
    }

    const data = await reportRepository.getCompanyConsumptionReport(companyId, start, end);

    const totals = data.reduce((acc, day) => ({
      orderCount: acc.orderCount + (parseInt(day.order_count) || 0),
      totalAmount: acc.totalAmount + (parseFloat(day.total_amount) || 0),
      companyPaid: acc.companyPaid + (parseFloat(day.company_paid) || 0),
      employeePaid: acc.employeePaid + (parseFloat(day.employee_paid) || 0)
    }), { orderCount: 0, totalAmount: 0, companyPaid: 0, employeePaid: 0 });

    const result = {
      companyId,
      period: {
        start,
        end,
        startJalali: toJalali(start),
        endJalali: toJalali(end)
      },
      summary: {
        totalOrders: {
          value: totals.orderCount,
          formatted: formatNumber(totals.orderCount),
          label: 'کل سفارشات'
        },
        totalAmount: {
          value: totals.totalAmount,
          formatted: formatPrice(totals.totalAmount),
          label: 'مبلغ کل'
        },
        companyPaid: {
          value: totals.companyPaid,
          formatted: formatPrice(totals.companyPaid),
          label: 'سهم شرکت'
        },
        employeePaid: {
          value: totals.employeePaid,
          formatted: formatPrice(totals.employeePaid),
          label: 'سهم کارمندان'
        },
        subsidyPercentage: {
          value: totals.totalAmount > 0 ? Math.round((totals.companyPaid / totals.totalAmount) * 100) : 0,
          formatted: `${totals.totalAmount > 0 ? Math.round((totals.companyPaid / totals.totalAmount) * 100) : 0}%`,
          label: 'درصد یارانه'
        }
      },
      dailyData: data.map(day => ({
        date: day.date,
        dateJalali: toJalali(day.date),
        orderCount: parseInt(day.order_count) || 0,
        totalAmount: parseFloat(day.total_amount) || 0,
        totalAmountFormatted: formatPrice(day.total_amount || 0),
        companyPaid: parseFloat(day.company_paid) || 0,
        employeePaid: parseFloat(day.employee_paid) || 0,
        employeeCount: parseInt(day.employee_count) || 0
      })),
      generatedAt: new Date().toISOString()
    };

    await redisClient.set(cacheKey, result, config.cache.ttl.daily);

    return result;
  }

  // Popular items report
  async getPopularItems(options = {}) {
    const { limit = 10, startDate, endDate } = options;
    
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const end = endDate || new Date().toISOString();

    const cacheKey = `reports:popular:${limit}:${start}:${end}`;

    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return cached;
    }

    const data = await reportRepository.getPopularItemsReport(limit, start, end);

    const result = {
      period: {
        start,
        end,
        startJalali: toJalali(start),
        endJalali: toJalali(end)
      },
      items: data.map((item, index) => ({
        rank: index + 1,
        foodId: item.food_id,
        foodName: item.food_name,
        orderCount: parseInt(item.order_count) || 0,
        totalQuantity: parseInt(item.total_quantity) || 0,
        totalRevenue: parseFloat(item.total_revenue) || 0,
        totalRevenueFormatted: formatPrice(item.total_revenue || 0),
        avgPrice: parseFloat(item.avg_price) || 0,
        avgPriceFormatted: formatPrice(item.avg_price || 0)
      })),
      generatedAt: new Date().toISOString()
    };

    await redisClient.set(cacheKey, result, config.cache.ttl.daily);

    return result;
  }

  // Helper: Calculate percentage change
  calculateChange(current, previous) {
    if (!previous || previous === 0) return { value: 0, formatted: '0%', direction: 'neutral' };
    
    const change = ((current - previous) / previous) * 100;
    return {
      value: Math.round(change * 10) / 10,
      formatted: `${change >= 0 ? '+' : ''}${Math.round(change * 10) / 10}%`,
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral'
    };
  }
}

module.exports = new ReportService();
