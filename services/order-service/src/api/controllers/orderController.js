const orderService = require('../../services/orderService');

class OrderController {
  async create(req, res, next) {
    try {
      const userId = req.headers['x-user-id'];
      const companyId = req.headers['x-company-id'];
      
      const { items, ...orderData } = req.body;
      
      const order = await orderService.createOrder(
        { ...orderData, userId, companyId },
        items
      );

      res.status(201).json({
        success: true,
        data: order,
        message: 'سفارش با موفقیت ثبت شد'
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const order = await orderService.getOrderById(req.params.id);
      
      res.json({
        success: true,
        data: order,
        message: 'اطلاعات با موفقیت دریافت شد'
      });
    } catch (error) {
      next(error);
    }
  }

  async getMyOrders(req, res, next) {
    try {
      const userId = req.headers['x-user-id'];
      const { page, limit, status, startDate, endDate, mealType } = req.query;
      
      const result = await orderService.getUserOrders(userId, {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10,
        status,
        startDate,
        endDate,
        mealType
      });

      res.json({
        success: true,
        data: result.orders,
        message: 'اطلاعات با موفقیت دریافت شد',
        meta: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: Math.ceil(result.total / result.limit)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getCompanyOrders(req, res, next) {
    try {
      const { companyId } = req.params;
      const { page, limit, status, startDate, endDate, mealType } = req.query;
      
      const result = await orderService.getCompanyOrders(companyId, {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10,
        status,
        startDate,
        endDate,
        mealType
      });

      res.json({
        success: true,
        data: result.orders,
        message: 'اطلاعات با موفقیت دریافت شد',
        meta: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: Math.ceil(result.total / result.limit)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req, res, next) {
    try {
      const { status, cancelReason } = req.body;
      const order = await orderService.updateOrderStatus(
        req.params.id, 
        status, 
        { cancelReason }
      );

      const messages = {
        confirmed: 'سفارش تأیید شد',
        preparing: 'سفارش در حال آماده‌سازی است',
        ready: 'سفارش آماده تحویل است',
        delivered: 'سفارش تحویل داده شد',
        cancelled: 'سفارش لغو شد'
      };

      res.json({
        success: true,
        data: order,
        message: messages[status] || 'وضعیت سفارش به‌روزرسانی شد'
      });
    } catch (error) {
      next(error);
    }
  }

  async cancel(req, res, next) {
    try {
      const userId = req.headers['x-user-id'];
      const { reason } = req.body;
      
      const order = await orderService.cancelOrder(req.params.id, userId, reason);

      res.json({
        success: true,
        data: order,
        message: 'سفارش با موفقیت لغو شد'
      });
    } catch (error) {
      next(error);
    }
  }

  async getStats(req, res, next) {
    try {
      const companyId = req.headers['x-company-id'] || req.params.companyId;
      const { startDate, endDate } = req.query;
      
      const stats = await orderService.getOrderStats(companyId, startDate, endDate);

      res.json({
        success: true,
        data: stats,
        message: 'آمار با موفقیت دریافت شد'
      });
    } catch (error) {
      next(error);
    }
  }

  async getDailySummary(req, res, next) {
    try {
      const companyId = req.headers['x-company-id'] || req.params.companyId;
      const { date } = req.query;
      
      const summary = await orderService.getDailyOrderSummary(
        companyId, 
        date || new Date().toISOString().split('T')[0]
      );

      res.json({
        success: true,
        data: summary,
        message: 'خلاصه سفارشات با موفقیت دریافت شد'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new OrderController();
