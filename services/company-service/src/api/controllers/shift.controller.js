const { shiftService } = require('../../services');

class ShiftController {
  async create(req, res, next) {
    try {
      const shift = await shiftService.create(req.params.id, req.body);
      res.status(201).json({ success: true, data: shift, message: 'شیفت ایجاد شد' });
    } catch (error) { next(error); }
  }

  async findByCompany(req, res, next) {
    try {
      const shifts = await shiftService.findByCompany(req.params.id);
      res.json({ success: true, data: shifts, message: 'لیست شیفت‌ها' });
    } catch (error) { next(error); }
  }

  async update(req, res, next) {
    try {
      const shift = await shiftService.update(req.params.id, req.params.shiftId, req.body);
      res.json({ success: true, data: shift, message: 'شیفت ویرایش شد' });
    } catch (error) { next(error); }
  }
}

module.exports = new ShiftController();
