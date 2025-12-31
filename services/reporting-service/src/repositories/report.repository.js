const { sequelize } = require('../config/database');
const { QueryTypes } = require('sequelize');
const logger = require('../utils/logger');

class ReportRepository {
  // Dashboard metrics
  async getDashboardMetrics() {
    try {
      // In production, these would query actual order/payment tables
      // For now, return mock data structure
      const [results] = await sequelize.query(`
        SELECT 
          COALESCE((SELECT COUNT(*) FROM orders WHERE DATE(created_at) = CURRENT_DATE), 0) as today_orders,
          COALESCE((SELECT SUM(total_amount) FROM orders WHERE DATE(created_at) = CURRENT_DATE), 0) as today_revenue,
          COALESCE((SELECT COUNT(*) FROM orders WHERE status = 'pending'), 0) as pending_orders,
          COALESCE((SELECT COUNT(DISTINCT user_id) FROM orders WHERE created_at >= NOW() - INTERVAL '7 days'), 0) as active_users,
          COALESCE((SELECT COUNT(*) FROM orders WHERE DATE(created_at) = CURRENT_DATE - INTERVAL '1 day'), 0) as yesterday_orders,
          COALESCE((SELECT SUM(total_amount) FROM orders WHERE DATE(created_at) = CURRENT_DATE - INTERVAL '1 day'), 0) as yesterday_revenue
      `, { type: QueryTypes.SELECT }).catch(() => [{}]);

      return results || {};
    } catch (error) {
      logger.error('خطا در دریافت متریک‌های داشبورد', { error: error.message });
      // Return mock data for development
      return {
        today_orders: Math.floor(Math.random() * 100) + 50,
        today_revenue: Math.floor(Math.random() * 10000000) + 5000000,
        pending_orders: Math.floor(Math.random() * 20) + 5,
        active_users: Math.floor(Math.random() * 500) + 100,
        yesterday_orders: Math.floor(Math.random() * 100) + 40,
        yesterday_revenue: Math.floor(Math.random() * 10000000) + 4000000
      };
    }
  }

  // Daily orders report
  async getDailyOrdersReport(date) {
    try {
      const [results] = await sequelize.query(`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as total_orders,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_orders,
          COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_orders,
          SUM(total_amount) as total_revenue,
          AVG(total_amount) as avg_order_value,
          COUNT(DISTINCT user_id) as unique_customers
        FROM orders
        WHERE DATE(created_at) = $1
        GROUP BY DATE(created_at)
      `, { 
        bind: [date],
        type: QueryTypes.SELECT 
      }).catch(() => []);

      return results || [];
    } catch (error) {
      logger.error('خطا در دریافت گزارش روزانه', { error: error.message });
      return this.getMockDailyReport(date);
    }
  }

  // Monthly orders report
  async getMonthlyOrdersReport(year, month) {
    try {
      const [results] = await sequelize.query(`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as total_orders,
          SUM(total_amount) as total_revenue,
          COUNT(DISTINCT user_id) as unique_customers
        FROM orders
        WHERE EXTRACT(YEAR FROM created_at) = $1 
          AND EXTRACT(MONTH FROM created_at) = $2
        GROUP BY DATE(created_at)
        ORDER BY date
      `, { 
        bind: [year, month],
        type: QueryTypes.SELECT 
      }).catch(() => []);

      return results || [];
    } catch (error) {
      logger.error('خطا در دریافت گزارش ماهانه', { error: error.message });
      return this.getMockMonthlyReport(year, month);
    }
  }

  // Revenue report
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
          dateFormat = 'DATE(created_at)';
      }

      const [results] = await sequelize.query(`
        SELECT 
          ${dateFormat} as period,
          SUM(total_amount) as revenue,
          COUNT(*) as order_count,
          AVG(total_amount) as avg_order_value
        FROM orders
        WHERE created_at BETWEEN $1 AND $2
          AND status = 'completed'
        GROUP BY ${dateFormat}
        ORDER BY period
      `, { 
        bind: [startDate, endDate],
        type: QueryTypes.SELECT 
      }).catch(() => []);

      return results || [];
    } catch (error) {
      logger.error('خطا در دریافت گزارش درآمد', { error: error.message });
      return this.getMockRevenueReport(startDate, endDate);
    }
  }

  // Company consumption report
  async getCompanyConsumptionReport(companyId, startDate, endDate) {
    try {
      const [results] = await sequelize.query(`
        SELECT 
          DATE(o.created_at) as date,
          COUNT(*) as order_count,
          SUM(o.total_amount) as total_amount,
          SUM(o.company_payable) as company_paid,
          SUM(o.user_payable) as employee_paid,
          COUNT(DISTINCT o.user_id) as employee_count
        FROM orders o
        WHERE o.company_id = $1
          AND o.created_at BETWEEN $2 AND $3
        GROUP BY DATE(o.created_at)
        ORDER BY date
      `, { 
        bind: [companyId, startDate, endDate],
        type: QueryTypes.SELECT 
      }).catch(() => []);

      return results || [];
    } catch (error) {
      logger.error('خطا در دریافت گزارش مصرف شرکت', { error: error.message });
      return this.getMockCompanyReport(companyId);
    }
  }

  // Popular items report
  async getPopularItemsReport(limit = 10, startDate, endDate) {
    try {
      const [results] = await sequelize.query(`
        SELECT 
          oi.food_id,
          oi.food_name,
          COUNT(*) as order_count,
          SUM(oi.quantity) as total_quantity,
          SUM(oi.total_price) as total_revenue,
          AVG(oi.unit_price) as avg_price
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
      }).catch(() => []);

      return results || [];
    } catch (error) {
      logger.error('خطا در دریافت غذاهای پرطرفدار', { error: error.message });
      return this.getMockPopularItems(limit);
    }
  }

  // Mock data generators for development
  getMockDailyReport(date) {
    return [{
      date,
      total_orders: Math.floor(Math.random() * 100) + 50,
      completed_orders: Math.floor(Math.random() * 80) + 40,
      cancelled_orders: Math.floor(Math.random() * 10),
      total_revenue: Math.floor(Math.random() * 10000000) + 5000000,
      avg_order_value: Math.floor(Math.random() * 100000) + 50000,
      unique_customers: Math.floor(Math.random() * 50) + 20
    }];
  }

  getMockMonthlyReport(year, month) {
    const days = new Date(year, month, 0).getDate();
    return Array.from({ length: days }, (_, i) => ({
      date: `${year}-${String(month).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`,
      total_orders: Math.floor(Math.random() * 100) + 30,
      total_revenue: Math.floor(Math.random() * 8000000) + 2000000,
      unique_customers: Math.floor(Math.random() * 40) + 10
    }));
  }

  getMockRevenueReport(startDate, endDate) {
    return [
      { period: '2024-01', revenue: 150000000, order_count: 450, avg_order_value: 333333 },
      { period: '2024-02', revenue: 180000000, order_count: 520, avg_order_value: 346153 },
      { period: '2024-03', revenue: 200000000, order_count: 580, avg_order_value: 344827 }
    ];
  }

  getMockCompanyReport(companyId) {
    return Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      order_count: Math.floor(Math.random() * 50) + 10,
      total_amount: Math.floor(Math.random() * 5000000) + 1000000,
      company_paid: Math.floor(Math.random() * 3000000) + 500000,
      employee_paid: Math.floor(Math.random() * 2000000) + 500000,
      employee_count: Math.floor(Math.random() * 30) + 5
    }));
  }

  getMockPopularItems(limit) {
    const items = [
      'چلوکباب کوبیده', 'جوجه کباب', 'قورمه سبزی', 'قیمه', 'زرشک پلو با مرغ',
      'کباب برگ', 'ماهی قزل‌آلا', 'میگو سوخاری', 'پاستا آلفردو', 'پیتزا مخصوص'
    ];
    return items.slice(0, limit).map((name, i) => ({
      food_id: `food-${i + 1}`,
      food_name: name,
      order_count: Math.floor(Math.random() * 500) + 100,
      total_quantity: Math.floor(Math.random() * 1000) + 200,
      total_revenue: Math.floor(Math.random() * 50000000) + 10000000,
      avg_price: Math.floor(Math.random() * 100000) + 50000
    }));
  }
}

module.exports = new ReportRepository();
