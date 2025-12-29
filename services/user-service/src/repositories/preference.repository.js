const { UserPreference } = require('../models');

class PreferenceRepository {
  async findByUserId(userId) {
    return UserPreference.findOne({ where: { userId } });
  }

  async create(data) {
    return UserPreference.create(data);
  }

  async update(userId, data) {
    const pref = await this.findByUserId(userId);
    if (!pref) return null;
    return pref.update(data);
  }

  async upsert(userId, data) {
    const [pref] = await UserPreference.upsert({ userId, ...data }, { returning: true });
    return pref;
  }
}

module.exports = new PreferenceRepository();
