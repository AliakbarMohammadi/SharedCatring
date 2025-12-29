const { UserProfile } = require('../models');

class ProfileRepository {
  async findByUserId(userId) {
    return UserProfile.findOne({ where: { userId } });
  }

  async create(data) {
    return UserProfile.create(data);
  }

  async update(userId, data) {
    const profile = await this.findByUserId(userId);
    if (!profile) return null;
    return profile.update(data);
  }

  async upsert(userId, data) {
    const [profile] = await UserProfile.upsert({ userId, ...data }, { returning: true });
    return profile;
  }
}

module.exports = new ProfileRepository();
