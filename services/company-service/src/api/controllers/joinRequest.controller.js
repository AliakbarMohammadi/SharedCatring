const { joinRequestService } = require('../../services');
const logger = require('../../utils/logger');

class JoinRequestController {
  /**
   * Create join request
   * POST /api/v1/companies/:id/join
   */
  async create(req, res, next) {
    try {
      const userId = req.headers['x-user-id'];
      const userRole = req.headers['x-user-role'];
      const companyId = req.params.id;
      const { message } = req.body;

      // Only personal_user can request to join
      if (userRole !== 'personal_user') {
        return res.status(403).json({
          success: false,
          error: {
            code: 'ERR_FORBIDDEN',
            message: 'فقط کاربران عادی می‌توانند درخواست عضویت ارسال کنند'
          }
        });
      }

      const request = await joinRequestService.create(userId, companyId, message);

      res.status(201).json({
        success: true,
        data: request,
        message: 'درخواست عضویت با موفقیت ارسال شد'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get my requests (for current user)
   * GET /api/v1/companies/my-requests
   */
  async getMyRequests(req, res, next) {
    try {
      const userId = req.headers['x-user-id'];
      const requests = await joinRequestService.findByUser(userId);

      res.json({
        success: true,
        data: requests,
        message: 'لیست درخواست‌های عضویت'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get requests for a company (admin)
   * GET /api/v1/companies/:id/requests
   */
  async findByCompany(req, res, next) {
    try {
      const companyId = req.params.id;
      const userRole = req.headers['x-user-role'];
      const { page, limit, status } = req.query;

      // Only super_admin or company_admin can view requests
      if (!['super_admin', 'company_admin'].includes(userRole)) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'ERR_FORBIDDEN',
            message: 'شما دسترسی به این بخش را ندارید'
          }
        });
      }

      const result = await joinRequestService.findByCompany(companyId, {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
        status
      });

      res.json({
        success: true,
        data: result.requests,
        pagination: result.pagination,
        message: 'لیست درخواست‌های عضویت'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update request status (approve/reject)
   * PATCH /api/v1/companies/requests/:requestId/status
   */
  async updateStatus(req, res, next) {
    try {
      const { requestId } = req.params;
      const { status, reason } = req.body;
      const reviewerId = req.headers['x-user-id'];
      const userRole = req.headers['x-user-role'];

      // Only super_admin or company_admin can update status
      if (!['super_admin', 'company_admin'].includes(userRole)) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'ERR_FORBIDDEN',
            message: 'شما دسترسی به این عملیات را ندارید'
          }
        });
      }

      let result;
      if (status === 'approved') {
        result = await joinRequestService.approve(requestId, reviewerId);
      } else if (status === 'rejected') {
        result = await joinRequestService.reject(requestId, reviewerId, reason);
      } else {
        return res.status(400).json({
          success: false,
          error: {
            code: 'ERR_INVALID_STATUS',
            message: 'وضعیت نامعتبر است'
          }
        });
      }

      res.json({
        success: true,
        data: result,
        message: status === 'approved' ? 'درخواست تأیید شد' : 'درخواست رد شد'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cancel pending request (by user)
   * DELETE /api/v1/companies/requests/:requestId
   */
  async cancel(req, res, next) {
    try {
      const { requestId } = req.params;
      const userId = req.headers['x-user-id'];

      const result = await joinRequestService.cancel(requestId, userId);

      res.json({
        success: true,
        data: result,
        message: 'درخواست لغو شد'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new JoinRequestController();
