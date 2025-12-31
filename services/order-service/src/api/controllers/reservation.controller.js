const { reservationService } = require('../../services');

class ReservationController {
  async create(req, res, next) {
    try {
      const userId = req.user.userId;
      const reservation = await reservationService.create(userId, req.body);

      res.status(201).json({
        success: true,
        data: reservation,
        message: 'رزرو هفتگی با موفقیت ثبت شد'
      });
    } catch (error) {
      next(error);
    }
  }

  async getCurrent(req, res, next) {
    try {
      const userId = req.user.userId;
      const reservation = await reservationService.getCurrentReservation(userId);

      if (!reservation) {
        return res.json({
          success: true,
          data: null,
          message: 'رزرو هفتگی فعالی وجود ندارد'
        });
      }

      res.json({
        success: true,
        data: reservation,
        message: 'رزرو هفتگی جاری'
      });
    } catch (error) {
      next(error);
    }
  }

  async findById(req, res, next) {
    try {
      const reservation = await reservationService.findById(req.params.id);

      res.json({
        success: true,
        data: reservation,
        message: 'اطلاعات رزرو'
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const userId = req.user.userId;
      const { id } = req.params;
      const reservation = await reservationService.update(id, userId, req.body);

      res.json({
        success: true,
        data: reservation,
        message: 'رزرو هفتگی به‌روزرسانی شد'
      });
    } catch (error) {
      next(error);
    }
  }

  async cancelDay(req, res, next) {
    try {
      const userId = req.user.userId;
      const { id, date } = req.params;
      const reservation = await reservationService.cancelDay(id, userId, date);

      res.json({
        success: true,
        data: reservation,
        message: 'روز از رزرو لغو شد'
      });
    } catch (error) {
      next(error);
    }
  }

  async cancel(req, res, next) {
    try {
      const userId = req.user.userId;
      const { id } = req.params;
      const reservation = await reservationService.cancel(id, userId);

      res.json({
        success: true,
        data: reservation,
        message: 'رزرو هفتگی لغو شد'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ReservationController();
