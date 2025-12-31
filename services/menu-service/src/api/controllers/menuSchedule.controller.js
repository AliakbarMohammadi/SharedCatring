const { menuScheduleService } = require('../../services');

class MenuScheduleController {
  async create(req, res, next) {
    try {
      const schedule = await menuScheduleService.create(req.body);

      res.status(201).json({
        success: true,
        data: schedule,
        message: 'برنامه غذایی با موفقیت ایجاد شد'
      });
    } catch (error) {
      next(error);
    }
  }

  async getTodayMenu(req, res, next) {
    try {
      const { mealType } = req.query;
      const menu = await menuScheduleService.getTodayMenu(mealType);

      res.json({
        success: true,
        data: menu,
        message: 'منوی امروز'
      });
    } catch (error) {
      next(error);
    }
  }

  async getWeeklyMenu(req, res, next) {
    try {
      const { startDate } = req.query;
      const menu = await menuScheduleService.getWeeklyMenu(startDate ? new Date(startDate) : null);

      res.json({
        success: true,
        data: menu,
        message: 'منوی هفتگی'
      });
    } catch (error) {
      next(error);
    }
  }

  async getByDate(req, res, next) {
    try {
      const menu = await menuScheduleService.getByDate(req.params.date);

      res.json({
        success: true,
        data: menu,
        message: 'منوی تاریخ مورد نظر'
      });
    } catch (error) {
      next(error);
    }
  }

  async findById(req, res, next) {
    try {
      const schedule = await menuScheduleService.findById(req.params.id);

      res.json({
        success: true,
        data: schedule,
        message: 'اطلاعات برنامه غذایی'
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const schedule = await menuScheduleService.update(req.params.id, req.body);

      res.json({
        success: true,
        data: schedule,
        message: 'برنامه غذایی با موفقیت ویرایش شد'
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await menuScheduleService.delete(req.params.id);

      res.json({
        success: true,
        data: null,
        message: 'برنامه غذایی با موفقیت حذف شد'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new MenuScheduleController();
