const userRepository = require('../repositories/userRepository');

class UserService {
  async createUser(userData) {
    // Check if email exists
    const existingUser = await userRepository.findByEmail(userData.email);
    if (existingUser) {
      const error = new Error('این ایمیل قبلاً ثبت شده است');
      error.statusCode = 409;
      error.errorCode = 'ERR_1202';
      throw error;
    }

    const user = await userRepository.create({
      ...userData,
      email: userData.email.toLowerCase()
    });

    return user;
  }

  async getUserById(id) {
    const user = await userRepository.findById(id);
    if (!user) {
      const error = new Error('کاربر یافت نشد');
      error.statusCode = 404;
      error.errorCode = 'ERR_1200';
      throw error;
    }
    return user;
  }

  async getUsers(options) {
    return userRepository.findAll(options);
  }

  async getUsersByCompany(companyId, options) {
    return userRepository.findByCompany(companyId, options);
  }

  async updateUser(id, data) {
    const user = await userRepository.update(id, data);
    if (!user) {
      const error = new Error('کاربر یافت نشد');
      error.statusCode = 404;
      error.errorCode = 'ERR_1200';
      throw error;
    }
    return user;
  }

  async updateUserStatus(id, status) {
    const validStatuses = ['active', 'inactive', 'pending', 'suspended'];
    if (!validStatuses.includes(status)) {
      const error = new Error('وضعیت کاربر نامعتبر است');
      error.statusCode = 400;
      error.errorCode = 'ERR_1204';
      throw error;
    }

    const [updated] = await userRepository.updateStatus(id, status);
    if (!updated) {
      const error = new Error('کاربر یافت نشد');
      error.statusCode = 404;
      error.errorCode = 'ERR_1200';
      throw error;
    }

    return userRepository.findById(id);
  }

  async deleteUser(id) {
    const user = await userRepository.delete(id);
    if (!user) {
      const error = new Error('کاربر یافت نشد');
      error.statusCode = 404;
      error.errorCode = 'ERR_1200';
      throw error;
    }
    return user;
  }

  async updatePreferences(id, preferences) {
    const user = await userRepository.findById(id);
    if (!user) {
      const error = new Error('کاربر یافت نشد');
      error.statusCode = 404;
      error.errorCode = 'ERR_1200';
      throw error;
    }

    const updatedPreferences = {
      ...user.preferences,
      ...preferences
    };

    return userRepository.update(id, { preferences: updatedPreferences });
  }

  async assignToCompany(userId, companyId, role = 'employee') {
    const user = await userRepository.findById(userId);
    if (!user) {
      const error = new Error('کاربر یافت نشد');
      error.statusCode = 404;
      error.errorCode = 'ERR_1200';
      throw error;
    }

    return userRepository.update(userId, { companyId, role });
  }

  async removeFromCompany(userId) {
    return userRepository.update(userId, { companyId: null, departmentId: null });
  }
}

module.exports = new UserService();
