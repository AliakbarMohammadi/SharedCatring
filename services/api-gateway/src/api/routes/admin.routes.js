const express = require('express');
const router = express.Router();
const axios = require('axios');
const config = require('../../config');
const { requireAuth, requireAdmin } = require('../middlewares/auth');
const logger = require('../../utils/logger');

/**
 * Admin Stats Endpoint
 * GET /api/v1/admin/stats
 * آمار کلی برای داشبورد ادمین
 */
router.get('/stats', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    logger.info('دریافت آمار ادمین', { userId: req.user.userId });

    // Parallel requests to different services
    const [
      usersResponse,
      companiesResponse,
      ordersResponse,
      revenueResponse
    ] = await Promise.allSettled([
      // Get total users from User Service
      axios.get(`${config.services.user}/api/v1/users/stats`, {
        headers: {
          'X-User-ID': req.user.userId,
          'X-User-Role': req.user.role,
          'X-Correlation-ID': req.correlationId
        }
      }),
      
      // Get total companies from Company Service
      axios.get(`${config.services.company}/api/v1/companies/stats`, {
        headers: {
          'X-User-ID': req.user.userId,
          'X-User-Role': req.user.role,
          'X-Correlation-ID': req.correlationId
        }
      }),
      
      // Get order stats from Order Service
      axios.get(`${config.services.order}/api/v1/orders/stats`, {
        headers: {
          'X-User-ID': req.user.userId,
          'X-User-Role': req.user.role,
          'X-Correlation-ID': req.correlationId
        }
      }),
      
      // Get revenue from Reporting Service
      axios.get(`${config.services.reporting}/api/v1/reports/dashboard`, {
        headers: {
          'X-User-ID': req.user.userId,
          'X-User-Role': req.user.role,
          'X-Correlation-ID': req.correlationId
        }
      })
    ]);

    // Extract data with fallbacks
    const totalUsers = usersResponse.status === 'fulfilled' 
      ? usersResponse.value.data.data.totalUsers || 0 
      : 0;
      
    const totalCompanies = companiesResponse.status === 'fulfilled' 
      ? companiesResponse.value.data.data.totalCompanies || 0 
      : 0;
      
    const orderStats = ordersResponse.status === 'fulfilled' 
      ? ordersResponse.value.data.data 
      : { totalOrders: 0, todayOrders: 0 };
      
    const revenueData = revenueResponse.status === 'fulfilled' 
      ? revenueResponse.value.data.data 
      : { metrics: { todayRevenue: { value: 0 } } };

    // Calculate total revenue (sum of all time)
    let totalRevenue = 0;
    try {
      const totalRevenueResponse = await axios.get(
        `${config.services.reporting}/api/v1/reports/revenue?startDate=2020-01-01&endDate=${new Date().toISOString()}`,
        {
          headers: {
            'X-User-ID': req.user.userId,
            'X-User-Role': req.user.role,
            'X-Correlation-ID': req.correlationId
          }
        }
      );
      totalRevenue = totalRevenueResponse.data.data.summary.totalRevenue.value || 0;
    } catch (error) {
      logger.warn('خطا در دریافت کل درآمد', { error: error.message });
    }

    const stats = {
      totalUsers,
      totalCompanies,
      totalOrders: orderStats.totalOrders || 0,
      todayOrders: revenueData.metrics?.todayOrders?.value || 0,
      totalRevenue,
      todayRevenue: revenueData.metrics?.todayRevenue?.value || 0
    };

    res.json({
      success: true,
      data: stats,
      message: 'آمار ادمین با موفقیت دریافت شد'
    });

  } catch (error) {
    logger.error('خطا در دریافت آمار ادمین', { 
      error: error.message,
      userId: req.user.userId 
    });
    next(error);
  }
});

/**
 * Recent Orders Endpoint
 * GET /api/v1/admin/orders?limit=5
 * آخرین سفارشات برای داشبورد ادمین
 */
router.get('/orders', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { limit = 5, status } = req.query;
    
    logger.info('دریافت آخرین سفارشات ادمین', { 
      userId: req.user.userId,
      limit,
      status 
    });

    const queryParams = new URLSearchParams({
      limit: limit.toString(),
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });

    if (status) {
      queryParams.append('status', status);
    }

    const response = await axios.get(
      `${config.services.order}/api/v1/orders?${queryParams.toString()}`,
      {
        headers: {
          'X-User-ID': req.user.userId,
          'X-User-Role': req.user.role,
          'X-Correlation-ID': req.correlationId
        }
      }
    );

    res.json({
      success: true,
      data: response.data.data,
      message: 'آخرین سفارشات با موفقیت دریافت شد'
    });

  } catch (error) {
    logger.error('خطا در دریافت آخرین سفارشات', { 
      error: error.message,
      userId: req.user.userId 
    });
    
    // Return empty array on error to prevent dashboard crash
    res.json({
      success: true,
      data: {
        orders: [],
        pagination: { total: 0, page: 1, limit: parseInt(req.query.limit) || 5 }
      },
      message: 'خطا در دریافت سفارشات'
    });
  }
});

/**
 * Pending Companies Endpoint
 * GET /api/v1/admin/companies?status=pending
 * شرکت‌های در انتظار تایید
 */
router.get('/companies', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { status = 'pending', limit = 10 } = req.query;
    
    logger.info('دریافت شرکت‌های در انتظار تایید', { 
      userId: req.user.userId,
      status,
      limit 
    });

    const queryParams = new URLSearchParams({
      status,
      limit: limit.toString(),
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });

    const response = await axios.get(
      `${config.services.company}/api/v1/companies?${queryParams.toString()}`,
      {
        headers: {
          'X-User-ID': req.user.userId,
          'X-User-Role': req.user.role,
          'X-Correlation-ID': req.correlationId
        }
      }
    );

    res.json({
      success: true,
      data: response.data.data,
      message: 'شرکت‌های در انتظار تایید با موفقیت دریافت شد'
    });

  } catch (error) {
    logger.error('خطا در دریافت شرکت‌های در انتظار تایید', { 
      error: error.message,
      userId: req.user.userId 
    });
    
    // Return empty array on error to prevent dashboard crash
    res.json({
      success: true,
      data: {
        companies: [],
        pagination: { total: 0, page: 1, limit: parseInt(req.query.limit) || 10 }
      },
      message: 'خطا در دریافت شرکت‌ها'
    });
  }
});

module.exports = router;