/**
 * User roles and permissions
 */

const ROLES = {
  SUPER_ADMIN: 'super_admin',
  COMPANY_ADMIN: 'company_admin',
  COMPANY_MANAGER: 'company_manager',
  EMPLOYEE: 'employee',
  KITCHEN_STAFF: 'kitchen_staff',
  DELIVERY_STAFF: 'delivery_staff'
};

const ROLE_LABELS = {
  [ROLES.SUPER_ADMIN]: 'مدیر ارشد سیستم',
  [ROLES.COMPANY_ADMIN]: 'مدیر شرکت',
  [ROLES.COMPANY_MANAGER]: 'مدیر بخش',
  [ROLES.EMPLOYEE]: 'کارمند',
  [ROLES.KITCHEN_STAFF]: 'پرسنل آشپزخانه',
  [ROLES.DELIVERY_STAFF]: 'پرسنل تحویل'
};

const ROLE_HIERARCHY = {
  [ROLES.SUPER_ADMIN]: 100,
  [ROLES.COMPANY_ADMIN]: 80,
  [ROLES.COMPANY_MANAGER]: 60,
  [ROLES.KITCHEN_STAFF]: 40,
  [ROLES.DELIVERY_STAFF]: 40,
  [ROLES.EMPLOYEE]: 20
};

const PERMISSIONS = {
  // User permissions
  USER_CREATE: 'user:create',
  USER_READ: 'user:read',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',
  USER_MANAGE: 'user:manage',

  // Company permissions
  COMPANY_CREATE: 'company:create',
  COMPANY_READ: 'company:read',
  COMPANY_UPDATE: 'company:update',
  COMPANY_DELETE: 'company:delete',
  COMPANY_MANAGE: 'company:manage',

  // Menu permissions
  MENU_CREATE: 'menu:create',
  MENU_READ: 'menu:read',
  MENU_UPDATE: 'menu:update',
  MENU_DELETE: 'menu:delete',
  MENU_MANAGE: 'menu:manage',

  // Order permissions
  ORDER_CREATE: 'order:create',
  ORDER_READ: 'order:read',
  ORDER_READ_OWN: 'order:read:own',
  ORDER_UPDATE: 'order:update',
  ORDER_CANCEL: 'order:cancel',
  ORDER_MANAGE: 'order:manage',

  // Payment permissions
  PAYMENT_CREATE: 'payment:create',
  PAYMENT_READ: 'payment:read',
  PAYMENT_REFUND: 'payment:refund',

  // Report permissions
  REPORT_READ: 'report:read',
  REPORT_EXPORT: 'report:export',

  // System permissions
  SYSTEM_ADMIN: 'system:admin'
};

const ROLE_PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: [PERMISSIONS.SYSTEM_ADMIN],
  [ROLES.COMPANY_ADMIN]: [
    PERMISSIONS.USER_MANAGE,
    PERMISSIONS.COMPANY_UPDATE,
    PERMISSIONS.MENU_MANAGE,
    PERMISSIONS.ORDER_MANAGE,
    PERMISSIONS.PAYMENT_READ,
    PERMISSIONS.PAYMENT_REFUND,
    PERMISSIONS.REPORT_READ,
    PERMISSIONS.REPORT_EXPORT
  ],
  [ROLES.COMPANY_MANAGER]: [
    PERMISSIONS.USER_READ,
    PERMISSIONS.MENU_READ,
    PERMISSIONS.ORDER_READ,
    PERMISSIONS.ORDER_UPDATE,
    PERMISSIONS.REPORT_READ
  ],
  [ROLES.EMPLOYEE]: [
    PERMISSIONS.MENU_READ,
    PERMISSIONS.ORDER_CREATE,
    PERMISSIONS.ORDER_READ_OWN,
    PERMISSIONS.ORDER_CANCEL
  ],
  [ROLES.KITCHEN_STAFF]: [
    PERMISSIONS.MENU_READ,
    PERMISSIONS.ORDER_READ,
    PERMISSIONS.ORDER_UPDATE
  ],
  [ROLES.DELIVERY_STAFF]: [
    PERMISSIONS.ORDER_READ,
    PERMISSIONS.ORDER_UPDATE
  ]
};

/**
 * Check if role has permission
 * @param {string} role - User role
 * @param {string} permission - Required permission
 * @returns {boolean}
 */
const hasPermission = (role, permission) => {
  if (role === ROLES.SUPER_ADMIN) return true;
  const rolePermissions = ROLE_PERMISSIONS[role] || [];
  return rolePermissions.includes(permission);
};

/**
 * Check if role is higher or equal in hierarchy
 * @param {string} role - User role
 * @param {string} requiredRole - Required role
 * @returns {boolean}
 */
const isRoleHigherOrEqual = (role, requiredRole) => {
  return (ROLE_HIERARCHY[role] || 0) >= (ROLE_HIERARCHY[requiredRole] || 0);
};

module.exports = {
  ROLES,
  ROLE_LABELS,
  ROLE_HIERARCHY,
  PERMISSIONS,
  ROLE_PERMISSIONS,
  hasPermission,
  isRoleHigherOrEqual
};
