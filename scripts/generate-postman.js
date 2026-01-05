const fs = require('fs');

const collection = {
  info: {
    _postman_id: "catering-api-2026",
    name: "🍽️ Catering Microservices API",
    description: "Complete API Collection - Base URL: http://localhost:3000",
    schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  auth: { type: "bearer", bearer: [{ key: "token", value: "{{accessToken}}" }] },
  variable: [
    { key: "baseUrl", value: "http://localhost:3000" },
    { key: "accessToken", value: "" },
    { key: "refreshToken", value: "" },
    { key: "userId", value: "" },
    { key: "companyId", value: "" },
    { key: "orderId", value: "" },
    { key: "foodId", value: "" },
    { key: "categoryId", value: "" },
    { key: "invoiceId", value: "" },
    { key: "paymentId", value: "" },
    { key: "fileId", value: "" },
    { key: "cartItemId", value: "" },
    { key: "departmentId", value: "" },
    { key: "employeeId", value: "" },
    { key: "scheduleId", value: "" },
    { key: "promotionId", value: "" },
    { key: "reservationId", value: "" },
    { key: "notificationId", value: "" }
  ],
  item: []
};

const h = [{ key: "Content-Type", value: "application/json" }];
const mkUrl = (path, query) => ({
  raw: `{{baseUrl}}${path}${query ? '?' + query : ''}`,
  host: ["{{baseUrl}}"],
  path: path.split('/').filter(p => p)
});

// Auth Service
const authItems = [
  { name: "Register", method: "POST", url: mkUrl("/api/v1/auth/register"), auth: { type: "noauth" }, header: h, body: { mode: "raw", raw: JSON.stringify({ email: "test@example.com", password: "Test@123456", firstName: "تست", lastName: "کاربر", phone: "09121234567", role: "personal_user" }, null, 2) },
    event: [{ listen: "test", script: { exec: ["if(pm.response.code===201){var d=pm.response.json();if(d.data?.tokens){pm.collectionVariables.set('accessToken',d.data.tokens.accessToken);pm.collectionVariables.set('refreshToken',d.data.tokens.refreshToken);}if(d.data?.user)pm.collectionVariables.set('userId',d.data.user.id);}"], type: "text/javascript" }}]
  },
  { name: "Login", method: "POST", url: mkUrl("/api/v1/auth/login"), auth: { type: "noauth" }, header: h, body: { mode: "raw", raw: JSON.stringify({ email: "superadmin@catering.com", password: "SuperAdmin@123" }, null, 2) },
    event: [{ listen: "test", script: { exec: ["if(pm.response.code===200){var d=pm.response.json();if(d.data?.tokens){pm.collectionVariables.set('accessToken',d.data.tokens.accessToken);pm.collectionVariables.set('refreshToken',d.data.tokens.refreshToken);}if(d.data?.user)pm.collectionVariables.set('userId',d.data.user.id);}"], type: "text/javascript" }}]
  },
  { name: "Refresh Token", method: "POST", url: mkUrl("/api/v1/auth/refresh-token"), auth: { type: "noauth" }, header: h, body: { mode: "raw", raw: JSON.stringify({ refreshToken: "{{refreshToken}}" }, null, 2) } },
  { name: "Logout", method: "POST", url: mkUrl("/api/v1/auth/logout") },
  { name: "Logout All", method: "POST", url: mkUrl("/api/v1/auth/logout-all") },
  { name: "Forgot Password", method: "POST", url: mkUrl("/api/v1/auth/forgot-password"), auth: { type: "noauth" }, header: h, body: { mode: "raw", raw: JSON.stringify({ email: "user@example.com" }, null, 2) } },
  { name: "Reset Password", method: "POST", url: mkUrl("/api/v1/auth/reset-password"), auth: { type: "noauth" }, header: h, body: { mode: "raw", raw: JSON.stringify({ token: "reset-token", password: "NewPass@123" }, null, 2) } },
  { name: "Verify Token", method: "POST", url: mkUrl("/api/v1/auth/verify-token"), auth: { type: "noauth" }, header: h, body: { mode: "raw", raw: JSON.stringify({ token: "{{accessToken}}" }, null, 2) } },
  { name: "Get Sessions", method: "GET", url: mkUrl("/api/v1/auth/sessions") }
];
collection.item.push({ name: "🔐 1. Auth", item: authItems.map(i => ({ name: i.name, request: { method: i.method, url: i.url, auth: i.auth, header: i.header, body: i.body }, event: i.event })) });

// Identity Service
const identityItems = [
  { name: "Create User", method: "POST", url: mkUrl("/api/v1/identity/users"), header: h, body: { mode: "raw", raw: JSON.stringify({ email: "new@example.com", firstName: "کاربر", lastName: "جدید", role: "personal_user" }, null, 2) } },
  { name: "Get All Users", method: "GET", url: mkUrl("/api/v1/identity/users", "page=1&limit=20") },
  { name: "Get User by ID", method: "GET", url: mkUrl("/api/v1/identity/users/{{userId}}") },
  { name: "Get User by Email", method: "GET", url: mkUrl("/api/v1/identity/users/by-email/test@example.com") },
  { name: "Update User", method: "PUT", url: mkUrl("/api/v1/identity/users/{{userId}}"), header: h, body: { mode: "raw", raw: JSON.stringify({ firstName: "علی", lastName: "محمدی" }, null, 2) } },
  { name: "Update Status", method: "PATCH", url: mkUrl("/api/v1/identity/users/{{userId}}/status"), header: h, body: { mode: "raw", raw: JSON.stringify({ status: "active" }, null, 2) } },
  { name: "Assign Role", method: "POST", url: mkUrl("/api/v1/identity/users/{{userId}}/assign-role"), header: h, body: { mode: "raw", raw: JSON.stringify({ role: "company_admin", companyId: "{{companyId}}" }, null, 2) } },
  { name: "Update Password", method: "PATCH", url: mkUrl("/api/v1/identity/users/{{userId}}/password"), header: h, body: { mode: "raw", raw: JSON.stringify({ currentPassword: "Old@123", newPassword: "New@123" }, null, 2) } },
  { name: "Delete User", method: "DELETE", url: mkUrl("/api/v1/identity/users/{{userId}}") }
];
collection.item.push({ name: "👤 2. Identity", item: identityItems.map(i => ({ name: i.name, request: { method: i.method, url: i.url, header: i.header, body: i.body } })) });

// User Service
const userItems = [
  { name: "Get Stats", method: "GET", url: mkUrl("/api/v1/users/stats") },
  { name: "Get All Users", method: "GET", url: mkUrl("/api/v1/users", "page=1&limit=20") },
  { name: "Get by Company", method: "GET", url: mkUrl("/api/v1/users/company/{{companyId}}") },
  { name: "Get User by ID", method: "GET", url: mkUrl("/api/v1/users/{{userId}}") },
  { name: "Create User", method: "POST", url: mkUrl("/api/v1/users"), header: h, body: { mode: "raw", raw: JSON.stringify({ email: "new@example.com", firstName: "کاربر", lastName: "جدید" }, null, 2) } },
  { name: "Update User", method: "PUT", url: mkUrl("/api/v1/users/{{userId}}"), header: h, body: { mode: "raw", raw: JSON.stringify({ firstName: "علی", lastName: "رضایی" }, null, 2) } },
  { name: "Update Status", method: "PATCH", url: mkUrl("/api/v1/users/{{userId}}/status"), header: h, body: { mode: "raw", raw: JSON.stringify({ status: "active" }, null, 2) } },
  { name: "Update Preferences", method: "PATCH", url: mkUrl("/api/v1/users/{{userId}}/preferences"), header: h, body: { mode: "raw", raw: JSON.stringify({ language: "fa", notifications: { email: true, sms: false } }, null, 2) } },
  { name: "Assign to Company", method: "POST", url: mkUrl("/api/v1/users/{{userId}}/assign-company"), header: h, body: { mode: "raw", raw: JSON.stringify({ companyId: "{{companyId}}" }, null, 2) } },
  { name: "Delete User", method: "DELETE", url: mkUrl("/api/v1/users/{{userId}}") }
];
collection.item.push({ name: "👥 3. User", item: userItems.map(i => ({ name: i.name, request: { method: i.method, url: i.url, header: i.header, body: i.body } })) });

// Company Service
const companyItems = [
  { name: "Get Stats", method: "GET", url: mkUrl("/api/v1/companies/stats") },
  { name: "Create Company", method: "POST", url: mkUrl("/api/v1/companies"), header: h, body: { mode: "raw", raw: JSON.stringify({ name: "شرکت نمونه", nationalId: "12345678901", address: "تهران", phone: "02112345678", email: "info@company.ir" }, null, 2) },
    event: [{ listen: "test", script: { exec: ["if(pm.response.code===201){var d=pm.response.json();if(d.data?.id)pm.collectionVariables.set('companyId',d.data.id);}"], type: "text/javascript" }}]
  },
  { name: "Get All Companies", method: "GET", url: mkUrl("/api/v1/companies", "page=1&limit=20") },
  { name: "Get Company by ID", method: "GET", url: mkUrl("/api/v1/companies/{{companyId}}") },
  { name: "Update Company", method: "PUT", url: mkUrl("/api/v1/companies/{{companyId}}"), header: h, body: { mode: "raw", raw: JSON.stringify({ name: "شرکت ویرایش شده" }, null, 2) } },
  { name: "Update Status", method: "PATCH", url: mkUrl("/api/v1/companies/{{companyId}}/status"), header: h, body: { mode: "raw", raw: JSON.stringify({ status: "active" }, null, 2) } },
  { name: "Get Dashboard", method: "GET", url: mkUrl("/api/v1/companies/{{companyId}}/dashboard") },
  { name: "Create Department", method: "POST", url: mkUrl("/api/v1/companies/{{companyId}}/departments"), header: h, body: { mode: "raw", raw: JSON.stringify({ name: "فناوری اطلاعات", code: "IT" }, null, 2) },
    event: [{ listen: "test", script: { exec: ["if(pm.response.code===201){var d=pm.response.json();if(d.data?.id)pm.collectionVariables.set('departmentId',d.data.id);}"], type: "text/javascript" }}]
  },
  { name: "Get Departments", method: "GET", url: mkUrl("/api/v1/companies/{{companyId}}/departments") },
  { name: "Update Department", method: "PUT", url: mkUrl("/api/v1/companies/{{companyId}}/departments/{{departmentId}}"), header: h, body: { mode: "raw", raw: JSON.stringify({ name: "IT Department" }, null, 2) } },
  { name: "Delete Department", method: "DELETE", url: mkUrl("/api/v1/companies/{{companyId}}/departments/{{departmentId}}") },
  { name: "Add Employee", method: "POST", url: mkUrl("/api/v1/companies/{{companyId}}/employees"), header: h, body: { mode: "raw", raw: JSON.stringify({ userId: "{{userId}}", employeeCode: "EMP001", departmentId: "{{departmentId}}" }, null, 2) },
    event: [{ listen: "test", script: { exec: ["if(pm.response.code===201){var d=pm.response.json();if(d.data?.id)pm.collectionVariables.set('employeeId',d.data.id);}"], type: "text/javascript" }}]
  },
  { name: "Bulk Add Employees", method: "POST", url: mkUrl("/api/v1/companies/{{companyId}}/employees/bulk"), header: h, body: { mode: "raw", raw: JSON.stringify({ employees: [{ email: "emp1@company.ir", firstName: "کارمند", lastName: "یک" }] }, null, 2) } },
  { name: "Get Employees", method: "GET", url: mkUrl("/api/v1/companies/{{companyId}}/employees") },
  { name: "Export Employees", method: "GET", url: mkUrl("/api/v1/companies/{{companyId}}/employees/export") },
  { name: "Get Employee", method: "GET", url: mkUrl("/api/v1/companies/{{companyId}}/employees/{{employeeId}}") },
  { name: "Update Employee", method: "PUT", url: mkUrl("/api/v1/companies/{{companyId}}/employees/{{employeeId}}"), header: h, body: { mode: "raw", raw: JSON.stringify({ position: "Senior Developer" }, null, 2) } },
  { name: "Delete Employee", method: "DELETE", url: mkUrl("/api/v1/companies/{{companyId}}/employees/{{employeeId}}") },
  { name: "Create Shift", method: "POST", url: mkUrl("/api/v1/companies/{{companyId}}/shifts"), header: h, body: { mode: "raw", raw: JSON.stringify({ name: "شیفت صبح", startTime: "08:00", endTime: "16:00", mealTypes: ["lunch"] }, null, 2) } },
  { name: "Get Shifts", method: "GET", url: mkUrl("/api/v1/companies/{{companyId}}/shifts") },
  { name: "Create Subsidy Rule", method: "POST", url: mkUrl("/api/v1/companies/{{companyId}}/subsidy-rules"), header: h, body: { mode: "raw", raw: JSON.stringify({ name: "یارانه ناهار", type: "percentage", value: 50, maxAmount: 100000, mealTypes: ["lunch"] }, null, 2) } },
  { name: "Get Subsidy Rules", method: "GET", url: mkUrl("/api/v1/companies/{{companyId}}/subsidy-rules") },
  { name: "Calculate Subsidy", method: "POST", url: mkUrl("/api/v1/companies/{{companyId}}/subsidy/calculate"), header: h, body: { mode: "raw", raw: JSON.stringify({ userId: "{{userId}}", amount: 150000, mealType: "lunch" }, null, 2) } }
];
collection.item.push({ name: "🏢 4. Company", item: companyItems.map(i => ({ name: i.name, request: { method: i.method, url: i.url, header: i.header, body: i.body }, event: i.event })) });

// Menu Service
const menuItems = [
  { name: "Get Categories", method: "GET", url: mkUrl("/api/v1/menus/categories"), auth: { type: "noauth" } },
  { name: "Get Category Tree", method: "GET", url: mkUrl("/api/v1/menus/categories/tree"), auth: { type: "noauth" } },
  { name: "Get Category", method: "GET", url: mkUrl("/api/v1/menus/categories/{{categoryId}}"), auth: { type: "noauth" } },
  { name: "Create Category", method: "POST", url: mkUrl("/api/v1/menus/categories"), header: h, body: { mode: "raw", raw: JSON.stringify({ name: "غذاهای ایرانی", description: "انواع غذاهای سنتی", order: 1 }, null, 2) },
    event: [{ listen: "test", script: { exec: ["if(pm.response.code===201){var d=pm.response.json();if(d.data?.id)pm.collectionVariables.set('categoryId',d.data.id);}"], type: "text/javascript" }}]
  },
  { name: "Update Category", method: "PUT", url: mkUrl("/api/v1/menus/categories/{{categoryId}}"), header: h, body: { mode: "raw", raw: JSON.stringify({ name: "غذاهای ایرانی ویرایش شده" }, null, 2) } },
  { name: "Delete Category", method: "DELETE", url: mkUrl("/api/v1/menus/categories/{{categoryId}}") },
  { name: "Get Food Items", method: "GET", url: mkUrl("/api/v1/menus/items", "page=1&limit=20"), auth: { type: "noauth" } },
  { name: "Get Popular Items", method: "GET", url: mkUrl("/api/v1/menus/items/popular"), auth: { type: "noauth" } },
  { name: "Get Featured Items", method: "GET", url: mkUrl("/api/v1/menus/items/featured"), auth: { type: "noauth" } },
  { name: "Get Food Item", method: "GET", url: mkUrl("/api/v1/menus/items/{{foodId}}"), auth: { type: "noauth" } },
  { name: "Get Nutrition", method: "GET", url: mkUrl("/api/v1/menus/items/{{foodId}}/nutrition"), auth: { type: "noauth" } },
  { name: "Get Prices", method: "GET", url: mkUrl("/api/v1/menus/items/{{foodId}}/prices"), auth: { type: "noauth" } },
  { name: "Create Food Item", method: "POST", url: mkUrl("/api/v1/menus/items"), header: h, body: { mode: "raw", raw: JSON.stringify({ name: "چلوکباب کوبیده", description: "دو سیخ کباب با برنج", categoryId: "{{categoryId}}", pricing: { basePrice: 150000 }, preparationTime: 30 }, null, 2) },
    event: [{ listen: "test", script: { exec: ["if(pm.response.code===201){var d=pm.response.json();if(d.data?.id)pm.collectionVariables.set('foodId',d.data.id);}"], type: "text/javascript" }}]
  },
  { name: "Update Food Item", method: "PUT", url: mkUrl("/api/v1/menus/items/{{foodId}}"), header: h, body: { mode: "raw", raw: JSON.stringify({ name: "چلوکباب ویژه" }, null, 2) } },
  { name: "Update Availability", method: "PATCH", url: mkUrl("/api/v1/menus/items/{{foodId}}/availability"), header: h, body: { mode: "raw", raw: JSON.stringify({ isAvailable: true }, null, 2) } },
  { name: "Update Prices", method: "PUT", url: mkUrl("/api/v1/menus/items/{{foodId}}/prices"), header: h, body: { mode: "raw", raw: JSON.stringify({ basePrice: 160000 }, null, 2) } },
  { name: "Add Corporate Price", method: "POST", url: mkUrl("/api/v1/menus/items/{{foodId}}/prices/corporate"), header: h, body: { mode: "raw", raw: JSON.stringify({ companyId: "{{companyId}}", price: 120000, discountPercentage: 20 }, null, 2) } },
  { name: "Delete Food Item", method: "DELETE", url: mkUrl("/api/v1/menus/items/{{foodId}}") },
  { name: "Get Today Menu", method: "GET", url: mkUrl("/api/v1/menus/daily"), auth: { type: "noauth" } },
  { name: "Get Weekly Menu", method: "GET", url: mkUrl("/api/v1/menus/weekly"), auth: { type: "noauth" } },
  { name: "Get Menu by Date", method: "GET", url: mkUrl("/api/v1/menus/date/2024-01-15"), auth: { type: "noauth" } },
  { name: "Create Schedule", method: "POST", url: mkUrl("/api/v1/menus/schedule"), header: h, body: { mode: "raw", raw: JSON.stringify({ date: "2024-01-15", mealType: "lunch", items: [{ foodId: "{{foodId}}", maxQuantity: 100 }], orderDeadline: "2024-01-15T10:00:00Z" }, null, 2) },
    event: [{ listen: "test", script: { exec: ["if(pm.response.code===201){var d=pm.response.json();if(d.data?.id)pm.collectionVariables.set('scheduleId',d.data.id);}"], type: "text/javascript" }}]
  },
  { name: "Update Schedule", method: "PUT", url: mkUrl("/api/v1/menus/schedule/{{scheduleId}}"), header: h, body: { mode: "raw", raw: JSON.stringify({ maxQuantity: 150 }, null, 2) } },
  { name: "Delete Schedule", method: "DELETE", url: mkUrl("/api/v1/menus/schedule/{{scheduleId}}") },
  { name: "Get Promotions", method: "GET", url: mkUrl("/api/v1/menus/promotions") },
  { name: "Create Promotion", method: "POST", url: mkUrl("/api/v1/menus/promotions"), header: h, body: { mode: "raw", raw: JSON.stringify({ code: "NEWYEAR20", name: "تخفیف سال نو", type: "percentage", value: 20, startDate: "2024-03-20", endDate: "2024-03-25" }, null, 2) },
    event: [{ listen: "test", script: { exec: ["if(pm.response.code===201){var d=pm.response.json();if(d.data?.id)pm.collectionVariables.set('promotionId',d.data.id);}"], type: "text/javascript" }}]
  },
  { name: "Validate Promo Code", method: "POST", url: mkUrl("/api/v1/menus/promotions/validate"), auth: { type: "noauth" }, header: h, body: { mode: "raw", raw: JSON.stringify({ code: "NEWYEAR20", orderAmount: 500000 }, null, 2) } },
  { name: "Update Promotion", method: "PUT", url: mkUrl("/api/v1/menus/promotions/{{promotionId}}"), header: h, body: { mode: "raw", raw: JSON.stringify({ value: 25 }, null, 2) } },
  { name: "Delete Promotion", method: "DELETE", url: mkUrl("/api/v1/menus/promotions/{{promotionId}}") }
];
collection.item.push({ name: "🍕 5. Menu", item: menuItems.map(i => ({ name: i.name, request: { method: i.method, url: i.url, auth: i.auth, header: i.header, body: i.body }, event: i.event })) });

// Order Service
const orderItems = [
  { name: "Get Cart", method: "GET", url: mkUrl("/api/v1/orders/cart") },
  { name: "Add to Cart", method: "POST", url: mkUrl("/api/v1/orders/cart/items"), header: h, body: { mode: "raw", raw: JSON.stringify({ foodId: "{{foodId}}", foodName: "چلوکباب کوبیده", quantity: 2, unitPrice: 150000 }, null, 2) },
    event: [{ listen: "test", script: { exec: ["if(pm.response.code===201){var d=pm.response.json();if(d.data?.id)pm.collectionVariables.set('cartItemId',d.data.id);}"], type: "text/javascript" }}]
  },
  { name: "Update Cart Item", method: "PUT", url: mkUrl("/api/v1/orders/cart/items/{{cartItemId}}"), header: h, body: { mode: "raw", raw: JSON.stringify({ quantity: 3 }, null, 2) } },
  { name: "Remove Cart Item", method: "DELETE", url: mkUrl("/api/v1/orders/cart/items/{{cartItemId}}") },
  { name: "Clear Cart", method: "DELETE", url: mkUrl("/api/v1/orders/cart") },
  { name: "Get Order Stats", method: "GET", url: mkUrl("/api/v1/orders/stats") },
  { name: "Create Order", method: "POST", url: mkUrl("/api/v1/orders"), header: h, body: { mode: "raw", raw: JSON.stringify({ orderType: "personal", items: [{ foodId: "{{foodId}}", foodName: "چلوکباب کوبیده", quantity: 2, unitPrice: 150000 }], deliveryDate: "2024-01-15", deliveryAddress: { address: "تهران، خیابان ولیعصر" } }, null, 2) },
    event: [{ listen: "test", script: { exec: ["if(pm.response.code===201){var d=pm.response.json();if(d.data?.id)pm.collectionVariables.set('orderId',d.data.id);}"], type: "text/javascript" }}]
  },
  { name: "Get My Orders", method: "GET", url: mkUrl("/api/v1/orders", "page=1&limit=20") },
  { name: "Create Bulk Order", method: "POST", url: mkUrl("/api/v1/orders/bulk"), header: h, body: { mode: "raw", raw: JSON.stringify({ companyId: "{{companyId}}", deliveryDate: "2024-01-15", orders: [] }, null, 2) } },
  { name: "Get Order by ID", method: "GET", url: mkUrl("/api/v1/orders/{{orderId}}") },
  { name: "Update Order Status", method: "PATCH", url: mkUrl("/api/v1/orders/{{orderId}}/status"), header: h, body: { mode: "raw", raw: JSON.stringify({ status: "preparing", notes: "در حال آماده‌سازی" }, null, 2) } },
  { name: "Cancel Order", method: "POST", url: mkUrl("/api/v1/orders/{{orderId}}/cancel"), header: h, body: { mode: "raw", raw: JSON.stringify({ reason: "تغییر برنامه" }, null, 2) } },
  { name: "Reorder", method: "POST", url: mkUrl("/api/v1/orders/{{orderId}}/reorder") },
  { name: "Kitchen - Today Orders", method: "GET", url: mkUrl("/api/v1/orders/kitchen/today") },
  { name: "Kitchen - Queue", method: "GET", url: mkUrl("/api/v1/orders/kitchen/queue") },
  { name: "Kitchen - Summary", method: "GET", url: mkUrl("/api/v1/orders/kitchen/summary") },
  { name: "Kitchen - Update Status", method: "PATCH", url: mkUrl("/api/v1/orders/kitchen/{{orderId}}/status"), header: h, body: { mode: "raw", raw: JSON.stringify({ status: "ready" }, null, 2) } },
  { name: "Company Orders", method: "GET", url: mkUrl("/api/v1/orders/company/{{companyId}}") },
  { name: "Company Summary", method: "GET", url: mkUrl("/api/v1/orders/company/{{companyId}}/summary") },
  { name: "Create Reservation", method: "POST", url: mkUrl("/api/v1/orders/reservations"), header: h, body: { mode: "raw", raw: JSON.stringify({ weekStartDate: "2024-01-15", items: [{ date: "2024-01-15", mealType: "lunch", foodId: "{{foodId}}", quantity: 1 }] }, null, 2) },
    event: [{ listen: "test", script: { exec: ["if(pm.response.code===201){var d=pm.response.json();if(d.data?.id)pm.collectionVariables.set('reservationId',d.data.id);}"], type: "text/javascript" }}]
  },
  { name: "Get Current Reservation", method: "GET", url: mkUrl("/api/v1/orders/reservations/current") },
  { name: "Get Reservation", method: "GET", url: mkUrl("/api/v1/orders/reservations/{{reservationId}}") },
  { name: "Update Reservation", method: "PUT", url: mkUrl("/api/v1/orders/reservations/{{reservationId}}"), header: h, body: { mode: "raw", raw: JSON.stringify({ items: [] }, null, 2) } },
  { name: "Cancel Reservation Day", method: "DELETE", url: mkUrl("/api/v1/orders/reservations/{{reservationId}}/day/2024-01-15") },
  { name: "Cancel Reservation", method: "DELETE", url: mkUrl("/api/v1/orders/reservations/{{reservationId}}") }
];
collection.item.push({ name: "📦 6. Order", item: orderItems.map(i => ({ name: i.name, request: { method: i.method, url: i.url, header: i.header, body: i.body }, event: i.event })) });

// Wallet Service
const walletItems = [
  { name: "Get Balance", method: "GET", url: mkUrl("/api/v1/wallets/balance") },
  { name: "Get Transactions", method: "GET", url: mkUrl("/api/v1/wallets/transactions", "page=1&limit=20") },
  { name: "Top Up Personal", method: "POST", url: mkUrl("/api/v1/wallets/topup"), header: h, body: { mode: "raw", raw: JSON.stringify({ amount: 100000, description: "شارژ کیف پول" }, null, 2) } },
  { name: "Get Company Pool", method: "GET", url: mkUrl("/api/v1/wallets/company/{{companyId}}") },
  { name: "Top Up Company", method: "POST", url: mkUrl("/api/v1/wallets/company/{{companyId}}/topup"), header: h, body: { mode: "raw", raw: JSON.stringify({ amount: 1000000, description: "شارژ ماهانه" }, null, 2) } },
  { name: "Allocate Subsidy", method: "POST", url: mkUrl("/api/v1/wallets/company/{{companyId}}/allocate"), header: h, body: { mode: "raw", raw: JSON.stringify({ employeeUserId: "{{userId}}", amount: 50000, description: "یارانه ناهار" }, null, 2) } },
  { name: "Get Company Employees", method: "GET", url: mkUrl("/api/v1/wallets/company/{{companyId}}/employees") }
];
collection.item.push({ name: "💰 7. Wallet", item: walletItems.map(i => ({ name: i.name, request: { method: i.method, url: i.url, header: i.header, body: i.body } })) });

// Payment Service
const paymentItems = [
  { name: "Create Payment", method: "POST", url: mkUrl("/api/v1/payments/request"), header: h, body: { mode: "raw", raw: JSON.stringify({ orderId: "{{orderId}}", amount: 240000, gateway: "zarinpal", description: "پرداخت سفارش" }, null, 2) },
    event: [{ listen: "test", script: { exec: ["if(pm.response.code===201){var d=pm.response.json();if(d.data?.paymentId)pm.collectionVariables.set('paymentId',d.data.paymentId);}"], type: "text/javascript" }}]
  },
  { name: "Verify Payment", method: "POST", url: mkUrl("/api/v1/payments/verify"), header: h, body: { mode: "raw", raw: JSON.stringify({ paymentId: "{{paymentId}}", Authority: "A00000000000000000000000000123456789", Status: "OK" }, null, 2) } },
  { name: "Get History", method: "GET", url: mkUrl("/api/v1/payments/history", "page=1&limit=20") },
  { name: "Track Payment", method: "GET", url: mkUrl("/api/v1/payments/tracking/PAY-1403-0001"), auth: { type: "noauth" } },
  { name: "Get Payment", method: "GET", url: mkUrl("/api/v1/payments/{{paymentId}}") },
  { name: "Request Refund", method: "POST", url: mkUrl("/api/v1/payments/{{paymentId}}/refund"), header: h, body: { mode: "raw", raw: JSON.stringify({ reason: "لغو سفارش" }, null, 2) } }
];
collection.item.push({ name: "💳 8. Payment", item: paymentItems.map(i => ({ name: i.name, request: { method: i.method, url: i.url, auth: i.auth, header: i.header, body: i.body }, event: i.event })) });

// Invoice Service
const invoiceItems = [
  { name: "Create Invoice", method: "POST", url: mkUrl("/api/v1/invoices"), header: h, body: { mode: "raw", raw: JSON.stringify({ type: "instant", items: [{ orderId: "{{orderId}}", description: "چلوکباب کوبیده", quantity: 2, unitPrice: 150000 }], taxRate: 9, customerName: "علی محمدی" }, null, 2) },
    event: [{ listen: "test", script: { exec: ["if(pm.response.code===201){var d=pm.response.json();if(d.data?.id)pm.collectionVariables.set('invoiceId',d.data.id);}"], type: "text/javascript" }}]
  },
  { name: "Get Invoices", method: "GET", url: mkUrl("/api/v1/invoices", "page=1&limit=20") },
  { name: "Get Invoice", method: "GET", url: mkUrl("/api/v1/invoices/{{invoiceId}}") },
  { name: "Get by Number", method: "GET", url: mkUrl("/api/v1/invoices/number/INV-1403-0001") },
  { name: "Update Status", method: "PATCH", url: mkUrl("/api/v1/invoices/{{invoiceId}}/status"), header: h, body: { mode: "raw", raw: JSON.stringify({ status: "paid" }, null, 2) } },
  { name: "Get PDF Link", method: "GET", url: mkUrl("/api/v1/invoices/{{invoiceId}}/pdf") },
  { name: "Download PDF", method: "GET", url: mkUrl("/api/v1/invoices/{{invoiceId}}/download") },
  { name: "Send Invoice", method: "POST", url: mkUrl("/api/v1/invoices/{{invoiceId}}/send") },
  { name: "Company Invoices", method: "GET", url: mkUrl("/api/v1/invoices/company/{{companyId}}") },
  { name: "Preview Consolidated", method: "POST", url: mkUrl("/api/v1/invoices/company/consolidated/preview"), header: h, body: { mode: "raw", raw: JSON.stringify({ companyId: "{{companyId}}", periodStart: "2024-01-01", periodEnd: "2024-01-31" }, null, 2) } },
  { name: "Generate Consolidated", method: "POST", url: mkUrl("/api/v1/invoices/company/consolidated"), header: h, body: { mode: "raw", raw: JSON.stringify({ companyId: "{{companyId}}", periodStart: "2024-01-01", periodEnd: "2024-01-31" }, null, 2) } }
];
collection.item.push({ name: "🧾 9. Invoice", item: invoiceItems.map(i => ({ name: i.name, request: { method: i.method, url: i.url, header: i.header, body: i.body }, event: i.event })) });

// Notification Service
const notificationItems = [
  { name: "Get Notifications", method: "GET", url: mkUrl("/api/v1/notifications", "page=1&limit=20") },
  { name: "Get Unread Count", method: "GET", url: mkUrl("/api/v1/notifications/unread-count") },
  { name: "Get Preferences", method: "GET", url: mkUrl("/api/v1/notifications/preferences") },
  { name: "Update Preferences", method: "PUT", url: mkUrl("/api/v1/notifications/preferences"), header: h, body: { mode: "raw", raw: JSON.stringify({ email: { enabled: true }, sms: { enabled: false }, categories: { order: true, payment: true } }, null, 2) } },
  { name: "Mark All Read", method: "PATCH", url: mkUrl("/api/v1/notifications/read-all") },
  { name: "Mark as Read", method: "PATCH", url: mkUrl("/api/v1/notifications/{{notificationId}}/read") },
  { name: "Send Notification", method: "POST", url: mkUrl("/api/v1/notifications/send"), header: h, body: { mode: "raw", raw: JSON.stringify({ userId: "{{userId}}", type: "in_app", category: "system", title: "اطلاعیه", body: "پیام تست" }, null, 2) } }
];
collection.item.push({ name: "🔔 10. Notification", item: notificationItems.map(i => ({ name: i.name, request: { method: i.method, url: i.url, header: i.header, body: i.body } })) });

// Reporting Service
const reportItems = [
  { name: "Get Dashboard", method: "GET", url: mkUrl("/api/v1/reports/dashboard") },
  { name: "Daily Report", method: "GET", url: mkUrl("/api/v1/reports/orders/daily", "date=2024-01-15") },
  { name: "Monthly Report", method: "GET", url: mkUrl("/api/v1/reports/orders/monthly", "year=1403&month=10") },
  { name: "Revenue Report", method: "GET", url: mkUrl("/api/v1/reports/revenue", "groupBy=day") },
  { name: "Company Consumption", method: "GET", url: mkUrl("/api/v1/reports/company/{{companyId}}/consumption") },
  { name: "Popular Items", method: "GET", url: mkUrl("/api/v1/reports/popular-items", "limit=10") },
  { name: "Export Report", method: "GET", url: mkUrl("/api/v1/reports/export", "type=daily&date=2024-01-15") }
];
collection.item.push({ name: "📊 11. Reporting", item: reportItems.map(i => ({ name: i.name, request: { method: i.method, url: i.url } })) });

// File Service
const fileItems = [
  { name: "Get My Files", method: "GET", url: mkUrl("/api/v1/files", "page=1&limit=20") },
  { name: "Upload File", method: "POST", url: mkUrl("/api/v1/files/upload"), body: { mode: "formdata", formdata: [{ key: "file", type: "file", src: "" }, { key: "isPublic", value: "false", type: "text" }] },
    event: [{ listen: "test", script: { exec: ["if(pm.response.code===201){var d=pm.response.json();if(d.data?.id)pm.collectionVariables.set('fileId',d.data.id);}"], type: "text/javascript" }}]
  },
  { name: "Bulk Upload", method: "POST", url: mkUrl("/api/v1/files/bulk-upload"), body: { mode: "formdata", formdata: [{ key: "files", type: "file", src: "" }] } },
  { name: "Download File", method: "GET", url: mkUrl("/api/v1/files/{{fileId}}") },
  { name: "Get File Info", method: "GET", url: mkUrl("/api/v1/files/{{fileId}}/info") },
  { name: "Get File URL", method: "GET", url: mkUrl("/api/v1/files/{{fileId}}/url") },
  { name: "Get Thumbnail", method: "GET", url: mkUrl("/api/v1/files/{{fileId}}/thumbnail") },
  { name: "Delete File", method: "DELETE", url: mkUrl("/api/v1/files/{{fileId}}") }
];
collection.item.push({ name: "📁 12. File", item: fileItems.map(i => ({ name: i.name, request: { method: i.method, url: i.url, body: i.body }, event: i.event })) });

// Write to file
fs.writeFileSync('./postman/Catering_API.postman_collection.json', JSON.stringify(collection, null, 2));
console.log('✅ Postman collection generated: postman/Catering_API.postman_collection.json');
console.log(`📊 Total folders: ${collection.item.length}`);
console.log(`📋 Total requests: ${collection.item.reduce((sum, folder) => sum + folder.item.length, 0)}`);
