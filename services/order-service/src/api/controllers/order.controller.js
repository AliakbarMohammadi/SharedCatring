const { orderService } = require('../../services');

class OrderController {
  async create(req, res, next) {
    try {
      const userId = req.user.userId || req.user.id;
      const user = {
        id: userId,
        companyId: req.user.companyId || null,
        role: req.user.role || 'user'
      };
      const order = await orderService.create(userId, req.body, user);

      res.status(201).json({
        success: true,
        data: order,
        message: 'سفارش با موفقیت ثبت شد'
      });
    } catch (error) {
      next(error);
    }
  }

  async findAll(req, res, next) {
    try {
      const userId = req.user.userId;
      const { page, limit, status, orderType, fromDate, toDate } = req.query;

      const result = await orderService.findAll(userId, {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
        status,
        orderType,
        fromDate,
        toDate
      });

      res.json({
        success: true,
        data: result.orders,
        pagination: result.pagination,
        message: 'لیست سفارشات'
      });
    } catch (error) {
      next(error);
    }
  }

  async findById(req, res, next) {
    try {
      const order = await orderService.findById(req.params.id);

      res.json({
        success: true,
        data: order,
        message: 'اطلاعات سفارش'
      });
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;
      const changedBy = req.user.userId;

      const order = await orderService.updateStatus(id, status, changedBy, notes);

      res.json({
        success: true,
        data: order,
        message: 'وضعیت سفارش به‌روزرسانی شد'
      });
    } catch (error) {
      next(error);
    }
  }

  async cancel(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;
      const { reason } = req.body;

      const order = await orderService.cancel(id, userId, reason);

      res.json({
        success: true,
        data: order,
        message: 'سفارش لغو شد'
      });
    } catch (error) {
      next(error);
    }
  }

  async reorder(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      const order = await orderService.reorder(id, userId);

      res.status(201).json({
        success: true,
        data: order,
        message: 'سفارش مجدد ثبت شد'
      });
    } catch (error) {
      next(error);
    }
  }

  // Kitchen endpoints
  async getTodayOrders(req, res, next) {
    try {
      const { mealType } = req.query;
      const orders = await orderService.getTodayOrders(mealType);

      res.json({
        success: true,
        data: orders,
        message: 'سفارشات امروز'
      });
    } catch (error) {
      next(error);
    }
  }

  async getKitchenQueue(req, res, next) {
    try {
      const orders = await orderService.getKitchenQueue();

      res.json({
        success: true,
        data: orders,
        message: 'صف آشپزخانه'
      });
    } catch (error) {
      next(error);
    }
  }

  async getKitchenSummary(req, res, next) {
    try {
      const { date } = req.query;
      const summary = await orderService.getKitchenSummary(date ? new Date(date) : new Date());

      res.json({
        success: true,
        data: summary,
        message: 'خلاصه آشپزخانه'
      });
    } catch (error) {
      next(error);
    }
  }

  async updateKitchenStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;
      const changedBy = req.user.userId;

      const order = await orderService.updateStatus(id, status, changedBy, notes);

      res.json({
        success: true,
        data: order,
        message: 'وضعیت سفارش به‌روزرسانی شد'
      });
    } catch (error) {
      next(error);
    }
  }

  // Company endpoints
  async getCompanyOrders(req, res, next) {
    try {
      const { companyId } = req.params;
      const { page, limit, status, fromDate, toDate } = req.query;

      const result = await orderService.getCompanyOrders(companyId, {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
        status,
        fromDate,
        toDate
      });

      res.json({
        success: true,
        data: result.orders,
        pagination: result.pagination,
        message: 'سفارشات شرکت'
      });
    } catch (error) {
      next(error);
    }
  }

  async getCompanySummary(req, res, next) {
    try {
      const { companyId } = req.params;
      const { fromDate, toDate } = req.query;

      const summary = await orderService.getCompanySummary(companyId, fromDate, toDate);

      res.json({
        success: true,
        data: summary,
        message: 'خلاصه سفارشات شرکت'
      });
    } catch (error) {
      next(error);
    }
  }

  // Bulk order
  async createBulkOrder(req, res, next) {
    try {
      const { companyId, deliveryDate, orders } = req.body;
      const results = [];

      for (const orderData of orders) {
        try {
          const user = { companyId, role: 'employee' };
          const order = await orderService.create(orderData.employeeId, {
            companyId,
            employeeId: orderData.employeeId,
            orderType: 'corporate',
            items: orderData.items,
            deliveryDate
          }, user);
          results.push({ success: true, order });
        } catch (error) {
          results.push({ success: false, employeeId: orderData.employeeId, error: error.message });
        }
      }

      res.status(201).json({
        success: true,
        data: {
          total: orders.length,
          successful: results.filter(r => r.success).length,
          failed: results.filter(r => !r.success).length,
          results
        },
        message: 'سفارشات گروهی ثبت شد'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new OrderController();
