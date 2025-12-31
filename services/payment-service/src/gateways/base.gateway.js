class BaseGateway {
  constructor(name) {
    this.name = name;
  }

  async createPayment(payment) {
    throw new Error('متد createPayment باید پیاده‌سازی شود');
  }

  async verifyPayment(authority, status) {
    throw new Error('متد verifyPayment باید پیاده‌سازی شود');
  }

  async refundPayment(payment, amount) {
    throw new Error('متد refundPayment باید پیاده‌سازی شود');
  }
}

module.exports = BaseGateway;
