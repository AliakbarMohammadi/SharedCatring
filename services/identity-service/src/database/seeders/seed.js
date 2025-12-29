const { Role, Permission, RolePermission } = require('../../models');
const logger = require('../../utils/logger');

const defaultRoles = [
  { name: 'super_admin', description: 'مدیر ارشد سیستم', isSystem: true },
  { name: 'catering_admin', description: 'مدیر کترینگ', isSystem: true },
  { name: 'kitchen_staff', description: 'پرسنل آشپزخانه', isSystem: true },
  { name: 'company_admin', description: 'مدیر شرکت', isSystem: true },
  { name: 'company_manager', description: 'مدیر واحد شرکت', isSystem: true },
  { name: 'employee', description: 'کارمند شرکت', isSystem: true },
  { name: 'personal_user', description: 'کاربر شخصی', isSystem: true }
];

const defaultPermissions = [
  // User permissions
  { name: 'users:create', resource: 'users', action: 'create', description: 'ایجاد کاربر' },
  { name: 'users:read', resource: 'users', action: 'read', description: 'مشاهده کاربران' },
  { name: 'users:update', resource: 'users', action: 'update', description: 'ویرایش کاربر' },
  { name: 'users:delete', resource: 'users', action: 'delete', description: 'حذف کاربر' },
  
  // Role permissions
  { name: 'roles:create', resource: 'roles', action: 'create', description: 'ایجاد نقش' },
  { name: 'roles:read', resource: 'roles', action: 'read', description: 'مشاهده نقش‌ها' },
  { name: 'roles:update', resource: 'roles', action: 'update', description: 'ویرایش نقش' },
  { name: 'roles:delete', resource: 'roles', action: 'delete', description: 'حذف نقش' },
  
  // Company permissions
  { name: 'companies:create', resource: 'companies', action: 'create', description: 'ایجاد شرکت' },
  { name: 'companies:read', resource: 'companies', action: 'read', description: 'مشاهده شرکت‌ها' },
  { name: 'companies:update', resource: 'companies', action: 'update', description: 'ویرایش شرکت' },
  { name: 'companies:delete', resource: 'companies', action: 'delete', description: 'حذف شرکت' },
  
  // Menu permissions
  { name: 'menus:create', resource: 'menus', action: 'create', description: 'ایجاد منو' },
  { name: 'menus:read', resource: 'menus', action: 'read', description: 'مشاهده منوها' },
  { name: 'menus:update', resource: 'menus', action: 'update', description: 'ویرایش منو' },
  { name: 'menus:delete', resource: 'menus', action: 'delete', description: 'حذف منو' },
  
  // Order permissions
  { name: 'orders:create', resource: 'orders', action: 'create', description: 'ایجاد سفارش' },
  { name: 'orders:read', resource: 'orders', action: 'read', description: 'مشاهده سفارش‌ها' },
  { name: 'orders:update', resource: 'orders', action: 'update', description: 'ویرایش سفارش' },
  { name: 'orders:delete', resource: 'orders', action: 'delete', description: 'حذف سفارش' },
  
  // Invoice permissions
  { name: 'invoices:create', resource: 'invoices', action: 'create', description: 'ایجاد فاکتور' },
  { name: 'invoices:read', resource: 'invoices', action: 'read', description: 'مشاهده فاکتورها' },
  
  // Payment permissions
  { name: 'payments:create', resource: 'payments', action: 'create', description: 'ایجاد پرداخت' },
  { name: 'payments:read', resource: 'payments', action: 'read', description: 'مشاهده پرداخت‌ها' },
  
  // Report permissions
  { name: 'reports:read', resource: 'reports', action: 'read', description: 'مشاهده گزارش‌ها' }
];

const rolePermissionMapping = {
  super_admin: ['*'], // All permissions
  catering_admin: [
    'users:read', 'menus:create', 'menus:read', 'menus:update', 'menus:delete',
    'orders:read', 'orders:update', 'invoices:read', 'payments:read', 'reports:read'
  ],
  kitchen_staff: ['menus:read', 'orders:read', 'orders:update'],
  company_admin: [
    'users:create', 'users:read', 'users:update', 'companies:read', 'companies:update',
    'menus:read', 'orders:create', 'orders:read', 'invoices:read', 'payments:read', 'reports:read'
  ],
  company_manager: [
    'users:read', 'menus:read', 'orders:create', 'orders:read', 'invoices:read', 'reports:read'
  ],
  employee: ['menus:read', 'orders:create', 'orders:read'],
  personal_user: ['menus:read', 'orders:create', 'orders:read', 'payments:create', 'payments:read']
};

const seedDatabase = async () => {
  try {
    // Seed roles
    for (const roleData of defaultRoles) {
      const [role, created] = await Role.findOrCreate({
        where: { name: roleData.name },
        defaults: roleData
      });
      if (created) {
        logger.info(`نقش ایجاد شد: ${role.name}`);
      }
    }

    // Seed permissions
    for (const permData of defaultPermissions) {
      const [permission, created] = await Permission.findOrCreate({
        where: { name: permData.name },
        defaults: permData
      });
      if (created) {
        logger.info(`دسترسی ایجاد شد: ${permission.name}`);
      }
    }

    // Assign permissions to roles
    const allPermissions = await Permission.findAll();
    const allRoles = await Role.findAll();

    for (const [roleName, permissionNames] of Object.entries(rolePermissionMapping)) {
      const role = allRoles.find(r => r.name === roleName);
      if (!role) continue;

      let permissionsToAssign;
      if (permissionNames.includes('*')) {
        permissionsToAssign = allPermissions;
      } else {
        permissionsToAssign = allPermissions.filter(p => permissionNames.includes(p.name));
      }

      for (const permission of permissionsToAssign) {
        await RolePermission.findOrCreate({
          where: { roleId: role.id, permissionId: permission.id },
          defaults: { roleId: role.id, permissionId: permission.id }
        });
      }
    }

    logger.info('داده‌های اولیه با موفقیت ایجاد شدند');
  } catch (error) {
    logger.error('خطا در ایجاد داده‌های اولیه', { error: error.message });
    throw error;
  }
};

module.exports = { seedDatabase, defaultRoles, defaultPermissions };
