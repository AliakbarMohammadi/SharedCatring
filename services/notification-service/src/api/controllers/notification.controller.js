const { notificationService } = require('../../services');
const logger = require('../../utils/logger');

class NotificationController {
  // Get user notifications
  async getNotifications(req, res, next) {
    try {
      const result = await notificationService.getUserNotifications(req.user.id, req.query);
      
      res.json({
        success: true,
        data: result.notifications,
        message: 'اعلان‌ها دریافت شد',
        meta: result.pagination
      });
    } catch (error) {
      next(error);
    }
  }

  // Get unread count
  async getUnreadCount(req, res, next) {
    try {
      const count = await notificationService.getUnreadCount(req.user.id);
      
      res.json({
        success: true,
        data: { unreadCount: count },
        message: 'تعداد اعلان‌های خوانده نشده'
      });
    } catch (error) {
      next(error);
    }
  }

  // Mark as read
  async markAsRead(req, res, next) {
    try {
      const notification = await notificationService.markAsRead(req.params.id, req.user.id);
      
      res.json({
        success: true,
        data: notification,
        message: 'اعلان خوانده شد'
      });
    } catch (error) {
      next(error);
    }
  }

  // Mark all as read
  async markAllAsRead(req, res, next) {
    try {
      const result = await notificationService.markAllAsRead(req.user.id);
      
      res.json({
        success: true,
        data: result,
        message: 'همه اعلان‌ها خوانده شدند'
      });
    } catch (error) {
      next(error);
    }
  }

  // Get preferences
  async getPreferences(req, res, next) {
    try {
      const prefs = await notificationService.getOrCreatePreferences(req.user.id);
      
      res.json({
        success: true,
        data: prefs,
        message: 'تنظیمات اعلان دریافت شد'
      });
    } catch (error) {
      next(error);
    }
  }

  // Update preferences
  async updatePreferences(req, res, next) {
    try {
      const prefs = await notificationService.updatePreferences(req.user.id, req.body);
      
      res.json({
        success: true,
        data: prefs,
        message: 'تنظیمات اعلان به‌روزرسانی شد'
      });
    } catch (error) {
      next(error);
    }
  }

  // Send notification (admin)
  async sendNotification(req, res, next) {
    try {
      const notification = await notificationService.send(req.body);
      
      res.status(201).json({
        success: true,
        data: notification,
        message: 'اعلان ارسال شد'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new NotificationController();
