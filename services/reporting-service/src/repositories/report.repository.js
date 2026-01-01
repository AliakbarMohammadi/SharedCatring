const { sequelize } = require('../config/database');
const { QueryTypes } = require('sequelize');
const logger = require('../utils/logger');

/**
 * Report Repository - Production Ready
 * مخزن گزارشات - آماده تولید
 * 
 * تمام mock ها حذف شده و فقط از داده‌های واقعی استفاده می‌شود
 */
class ReportRepository {
  /**
   * Dashboard metrics - Real data only
   * متریک‌های داشبورد - فقط داده‌های واقعی
   */
  async getDashboardMetrics() {
    try {
      const [results] = await sequelize.query(`
        SELECT 
          COALESCE((SELECT COUNT(*) FROM orders WHERE DATE(created_at) = CURRENT_DATE), 0) as today_orders,
          COALESCE((SELECT SUM(total_amount) FROM orders WHERE DATE(created_at) = CURRENT_DATE), 0) as today_revenue,
          COALESCE((SELECT COUNT(*) FROM orders WHERE status = 'pending'), 0) as pending_orders,
          COALESCE((SELECT COUNT(DISTINCT user_id) FROM orders WHERE created_at >= NOW() - INTERVAL '7 days'), 0) as active_users,
          COALESCE((SELECT COUNT(*) FROM orders WHERE DATE(created_at) = CURRENT_DATE - INTERVAL '1 day'), 0) as yesterday_orders,
          COALESCE((SELECT SUM(total_amount) FROM orders WHERE DATE(created_at) = CURRENT_DATE - INTERVAL '1 day'), 0) as yesterday_revenue
      `, { type: QueryTypes.SELECT });

      const metrics = results[0] || {};
      
      // Calculate growth percentages
      const orderGrowth = metrics.yesterday_orders > 0 
        ? ((metrics.today_orders - metrics.yesterday_orders) / metrics.yesterday_orders * 100).toFixed(1)
        : 0;
      
      const revenueGrowth = metrics.yesterday_revenue > 0
        ? ((metrics.today_revenue - metrics.yesterday_revenue) / metrics.yesterday_revenue * 100).toFixed(1)
        : 0;

      return {
        ...metrics,
        order_growth: parseFloat(orderGrowth),
        revenue_growth: parseFloat(revenueGrowth)
      };
    } catch (error) {
      logger.error('خطا در دریافت متریک‌های داشبورد', { error: error.message });
      throw {
        statusCode: 500,
        code: 'ERR_DATABASE_ERROR',
        message: 'خطا در دریافت اطلاعات داشبورد'
      };
    }
  }

  /**
   * Daily orders report - Real data only
   * گزارش سفارشات روزانه - فقط داده‌های واقعی
   */
  async getDailyOrdersReport(date) {
    try {
      const results = await sequelize.query(`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as total_orders,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_orders,
          COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_orders,
          COALESCE(SUM(total_amount), 0) as total_revenue,
          COALESCE(AVG(total_amount), 0) as avg_order_value,
          COUNT(DISTINCT user_id) as unique_customers
        FROM orders
        WHERE DATE(created_at) = $1
        GROUP BY DATE(created_at)
      `, { 
        bind: [date],
        type: QueryTypes.SELECT 
      });

      // Return empty array if no data (not mock data)
      if (!results || results.length === 0) {
        return [{
          date,
          total_orders: 0,
          completed_orders: 0,
          cancelled_orders: 0,
          total_revenue: 0,
          avg_order_value: 0,
          unique_customers: 0
        }];
      }

      return results;
    } catch (error) {
      logger.error('خطا در دریافت گزارش روزانه', { error: error.message, date });
      throw {
        statusCode: 500,
        code: 'ERR_DATABASE_ERROR',
        message: 'خطا در دریافت گزارش روزانه'
      };
    }
  }

  /**
   * Monthly orders report - Real data only
   * گزارش سفارشات ماهانه - فقط داده‌های واقعی
   */
  async getMonthlyOrdersReport(year, month) {
    try {
      const results = await sequelize.query(`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as total_orders,
          COALESCE(SUM(total_amount), 0) as total_revenue,
          COUNT(DISTINCT user_id) as unique_customers
        FROM orders
        WHERE EXTRACT(YEAR FROM created_at) = $1 
          AND EXTRACT(MONTH FROM created_at) = $2
        GROUP BY DATE(created_at)
        ORDER BY date
      `, { 
        bind: [year, month],
        type: QueryTypes.SELECT 
      });

      return results || [];
    } catch (error) {
      logger.error('خطا در دریافت گزارش ماهانه', { error: error.message, year, month });
      throw {
        statusCode: 500,
        code: 'ERR_DATABASE_ERROR',
        message: 'خطا در دریافت گزارش ماهانه'
      };
    }
  }

  /**
   * Revenue report - Real data only
   * گزارش درآمد - فقط داده‌های واقعی
   */
  async getRevenueReport(startDate, endDate, groupBy = 'day') {
    try {
      let dateFormat;
      switch (groupBy) {
        case 'month':
          dateFormat = "TO_CHAR(created_at, 'YYYY-MM')";
          break;
        case 'week':
          dateFormat = "TO_CHAR(created_at, 'IYYY-IW')";
          break;
        default:
          dateFormat = "TO_CHAR(created_at, 'YYYY-MM-DD')";
      }

      const results = await sequelize.query(`
        SELECT 
          ${dateFormat} as period,
          COALESCE(SUM(total_amount), 0) as revenue,
          COUNT(*) as order_count,
          COALESCE(AVG(total_amount), 0) as avg_order_value
        FROM orders
        WHERE created_at BETWEEN $1 AND $2
          AND status = 'completed'
        GROUP BY ${dateFormat}
        ORDER BY period
      `, { 
        bind: [startDate, endDate],
        type: QueryTypes.SELECT 
      });

      return results || [];
    } catch (error) {
      logger.error('خطا در دریافت گزارش درآمد', { error: error.message, startDate, endDate });
      throw {
        statusCode: 500,
        code: 'ERR_DATABASE_ERROR',
        message: 'خطا در دریافت گزارش درآمد'
      };
    }
  }

  /**
   * Company consumption report - Real data only
   * گزارش مصرف شرکت - فقط داده‌های واقعی
   */
  async getCompanyConsumptionReport(companyId, startDate, endDate) {
    try {
      const results = await sequelize.query(`
        SELECT 
          DATE(o.created_at) as date,
          COUNT(*) as order_count,
          COALESCE(SUM(o.total_amount), 0) as total_amount,
          COALESCE(SUM(o.company_payable), 0) as company_paid,
          COALESCE(SUM(o.user_payable), 0) as employee_paid,
          COUNT(DISTINCT o.user_id) as employee_count
        FROM orders o
        WHERE o.company_id = $1
          AND o.created_at BETWEEN $2 AND $3
        GROUP BY DATE(o.created_at)
        ORDER BY date DESC
      `, { 
        bind: [companyId, startDate, endDate],
        type: QueryTypes.SELECT 
      });

      return results || [];
    } catch (error) {
      logger.error('خطا در دریافت گزارش مصرف شرکت', { error: error.message, companyId });
      throw {
        statusCode: 500,
        code: 'ERR_DATABASE_ERROR',
        message: 'خطا در دریافت گزارش مصرف شرکت'
      };
    }
  }

  /**
   * Popular items report - Real data only
   * گزارش غذاهای پرطرفدار - فقط داده‌های واقعی
   */
  async getPopularItemsReport(limit = 10, startDate, endDate) {
    try {
      const results = await sequelize.query(`
        SELECT 
          oi.food_id,
          oi.food_name,
          COUNT(*) as order_count,
          COALESCE(SUM(oi.quantity), 0) as total_quantity,
          COALESCE(SUM(oi.total_price), 0) as total_revenue,
          COALESCE(AVG(oi.unit_price), 0) as avg_price
        FROM order_items oi
        JOIN orders o ON o.id = oi.order_id
        WHERE o.created_at BETWEEN $1 AND $2
          AND o.status = 'completed'
        GROUP BY oi.food_id, oi.food_name
        ORDER BY total_quantity DESC
        LIMIT $3
      `, { 
        bind: [startDate, endDate, limit],
        type: QueryTypes.SELECT 
      });

      return results || [];
    } catch (error) {
      logger.error('خطا در دریافت غذاهای پرطرفدار', { error: error.message });
      throw {
        statusCode: 500,
        code: 'ERR_DATABASE_ERROR',
        message: 'خطا در دریافت غذاهای پرطرفدار'
      };
    }
  }

  /**
   * User activity report - Real data only
   * گزارش فعالیت کاربران - فقط داده‌های واقعی
   */
  async getUserActivityReport(startDate, endDate) {
    try {
      const results = await sequelize.query(`
        SELECT 
          DATE(created_at) as date,
          COUNT(DISTINCT user_id) as active_users,
          COUNT(*) as total_orders,
          COALESCE(SUM(total_amount), 0) as total_spent
        FROM orders
        WHERE created_at BETWEEN $1 AND $2
        GROUP BY DATE(created_at)
        ORDER BY date
      `, { 
        bind: [startDate, endDate],
        type: QueryTypes.SELECT 
      });

      return results || [];
    } catch (error) {
      logger.error('خطا در دریافت گزارش فعالیت کاربران', { error: error.message });
      throw {
        statusCode: 500,
        code: 'ERR_DATABASE_ERROR',
        message: 'خطا در دریافت گزارش فعالیت کاربران'
      };
    }
  }

  /**
   * Payment methods report - Real data only
   * گزارش روش‌های پرداخت - فقط داده‌های واقعی
   */
  async getPaymentMethodsReport(startDate, endDate) {
    try {
      const results = await sequelize.query(`
        SELECT 
          payment_method,
          COUNT(*) as transaction_count,
          COALESCE(SUM(amount), 0) as total_amount,
          COALESCE(AVG(amount), 0) as avg_amount
        FROM payments
        WHERE created_at BETWEEN $1 AND $2
          AND status = 'completed'
        GROUP BY payment_method
        ORDER BY total_amount DESC
      `, { 
        bind: [startDate, endDate],
        type: QueryTypes.SELECT 
      });

      return results || [];
    } catch (error) {
      logger.error('خطا در دریافت گزارش روش‌های پرداخت', { error: error.message });
      throw {
        statusCode: 500,
        code: 'ERR_DATABASE_ERROR',
        message: 'خطا در دریافت گزارش روش‌های پرداخت'
      };
    }
  }

  /**
   * Order status distribution - Real data only
   * توزیع وضعیت سفارشات - فقط داده‌های واقعی
   */
  async getOrderStatusDistribution(startDate, endDate) {
    try {
      const results = await sequelize.query(`
        SELECT 
          status,
          COUNT(*) as count,
          COALESCE(SUM(total_amount), 0) as total_amount
        FROM orders
        WHERE created_at BETWEEN $1 AND $2
        GROUP BY status
        ORDER BY count DESC
      `, { 
        bind: [startDate, endDate],
        type: QueryTypes.SELECT 
      });

      return results || [];
    } catch (error) {
      logger.error('خطا در دریافت توزیع وضعیت سفارشات', { error: error.message });
      throw {
        statusCode: 500,
        code: 'ERR_DATABASE_ERROR',
        message: 'خطا در دریافت توزیع وضعیت سفارشات'
      };
    }
  }
}

module.exports = new ReportRepository();
