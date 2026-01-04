# Requirements Document

## Introduction

این سند نیازمندی‌های فاز 1 (MVP) فرانت‌اند سامانه کترینگ سازمانی را تعریف می‌کند. فاز 1 شامل احراز هویت، منوی روزانه، سبد خرید، پرداخت، تاریخچه سفارشات و پروفایل کاربر است. این سیستم با Next.js 14، TypeScript و Tailwind CSS پیاده‌سازی می‌شود و با 13 میکروسرویس بک‌اند ارتباط برقرار می‌کند.

## Glossary

- **Auth_System**: سیستم احراز هویت که مسئول ورود، ثبت‌نام و مدیریت توکن‌ها است
- **Menu_System**: سیستم نمایش منوی روزانه و آیتم‌های غذایی
- **Cart_System**: سیستم مدیریت سبد خرید کاربر
- **Order_System**: سیستم ثبت و پیگیری سفارشات
- **Payment_System**: سیستم پرداخت شامل کیف پول و درگاه آنلاین
- **Profile_System**: سیستم مدیریت پروفایل و آدرس‌های کاربر
- **User**: کاربر سیستم (personal_user یا employee)
- **Employee**: کارمند شرکت که از یارانه شرکتی استفاده می‌کند
- **Personal_User**: کاربر شخصی بدون یارانه شرکتی
- **Access_Token**: توکن دسترسی JWT برای احراز هویت درخواست‌ها
- **Refresh_Token**: توکن تازه‌سازی برای دریافت توکن دسترسی جدید
- **Wallet**: کیف پول الکترونیکی کاربر
- **Subsidy**: یارانه شرکتی برای کارمندان

## Requirements

### Requirement 1: User Authentication - Login

**User Story:** As a user, I want to log into the system with my email and password, so that I can access my personalized dashboard and place orders.

#### Acceptance Criteria

1. WHEN a user navigates to the login page, THE Auth_System SHALL display a form with email and password fields
2. WHEN a user submits valid credentials, THE Auth_System SHALL authenticate the user and store access and refresh tokens
3. WHEN authentication succeeds, THE Auth_System SHALL redirect the user based on their role:
   - super_admin, catering_admin → /admin/dashboard
   - kitchen_staff → /kitchen/queue
   - company_admin → /company/dashboard
   - employee, personal_user → /menu
4. WHEN a user submits invalid credentials, THE Auth_System SHALL display an appropriate error message in Persian
5. WHEN a user submits an empty email field, THE Auth_System SHALL display a validation error "ایمیل الزامی است"
6. WHEN a user submits an invalid email format, THE Auth_System SHALL display a validation error "فرمت ایمیل نامعتبر است"
7. WHEN a user submits a password shorter than 8 characters, THE Auth_System SHALL display a validation error "رمز عبور باید حداقل ۸ کاراکتر باشد"
8. WHILE the login request is processing, THE Auth_System SHALL display a loading indicator on the submit button

### Requirement 2: User Authentication - Registration

**User Story:** As a new user, I want to register an account, so that I can start using the catering system.

#### Acceptance Criteria

1. WHEN a user navigates to the registration page, THE Auth_System SHALL display a form with email, phone, password, confirm password, and role selection fields
2. WHEN a user submits valid registration data, THE Auth_System SHALL create a new account and display a success message
3. WHEN registration succeeds, THE Auth_System SHALL redirect the user to the login page
4. WHEN a user submits a phone number not matching the pattern 09xxxxxxxxx, THE Auth_System SHALL display a validation error "شماره موبایل باید با ۰۹ شروع شود"
5. WHEN passwords do not match, THE Auth_System SHALL display a validation error "رمز عبور و تکرار آن مطابقت ندارند"
6. WHEN an email is already registered, THE Auth_System SHALL display an error "این ایمیل قبلاً ثبت شده است"
7. THE Auth_System SHALL allow users to select their role as either personal_user or company_admin during registration

### Requirement 3: User Authentication - Password Recovery

**User Story:** As a user who forgot my password, I want to reset it, so that I can regain access to my account.

#### Acceptance Criteria

1. WHEN a user clicks "فراموشی رمز عبور" on the login page, THE Auth_System SHALL navigate to the password recovery page
2. WHEN a user submits a valid email, THE Auth_System SHALL send a password reset link and display a confirmation message
3. WHEN a user submits an unregistered email, THE Auth_System SHALL display an error "ایمیل در سیستم یافت نشد"

### Requirement 4: Daily Menu Display

**User Story:** As a user, I want to view the daily menu, so that I can see available food items and their prices.

#### Acceptance Criteria

1. WHEN a user navigates to the menu page, THE Menu_System SHALL display today's date in Persian (Shamsi) calendar format
2. THE Menu_System SHALL display food items in a responsive grid layout (cards)
3. WHEN the menu loads, THE Menu_System SHALL fetch daily menu items from the API endpoint GET /menu/daily
4. THE Menu_System SHALL display each food item with: image, name, description, price, discounted price (if applicable), and remaining quantity
5. WHEN a food item has attributes (isVegetarian, isSpicy), THE Menu_System SHALL display appropriate badges
6. THE Menu_System SHALL provide filter options for meal type (breakfast, lunch, dinner)
7. WHEN a food item's remaining quantity is zero, THE Menu_System SHALL display it as "ناموجود" and disable the add button
8. WHILE the menu is loading, THE Menu_System SHALL display skeleton loading placeholders

### Requirement 5: Shopping Cart Management

**User Story:** As a user, I want to manage my shopping cart, so that I can add, remove, and modify items before checkout.

#### Acceptance Criteria

1. WHEN a user clicks "افزودن به سبد" on a food card, THE Cart_System SHALL add the item to the cart with quantity 1
2. WHEN a user adds an item already in the cart, THE Cart_System SHALL increment its quantity by 1
3. THE Cart_System SHALL persist cart data in localStorage to survive page refreshes
4. WHEN a user views the cart page, THE Cart_System SHALL display all items with quantity selectors
5. WHEN a user changes item quantity, THE Cart_System SHALL update the quantity and recalculate totals
6. WHEN a user sets quantity to zero, THE Cart_System SHALL remove the item from the cart
7. THE Cart_System SHALL display a summary showing: subtotal, subsidy amount (for employees), and total payable
8. WHEN the cart is empty, THE Cart_System SHALL display an empty state with a link to the menu

### Requirement 6: Order Checkout

**User Story:** As a user, I want to complete my order, so that I can receive my food at the specified time and location.

#### Acceptance Criteria

1. WHEN a user proceeds to checkout, THE Order_System SHALL display a multi-step checkout flow
2. THE Order_System SHALL require the user to select or add a delivery address
3. THE Order_System SHALL require the user to select a delivery date
4. THE Order_System SHALL display an order summary with all items and pricing
5. THE Order_System SHALL offer payment methods: wallet balance and online payment gateway
6. WHEN a user selects wallet payment and has sufficient balance, THE Order_System SHALL process payment immediately
7. WHEN a user selects online payment, THE Order_System SHALL redirect to the payment gateway URL
8. WHEN order submission succeeds, THE Order_System SHALL clear the cart and redirect to order confirmation
9. IF order submission fails, THEN THE Order_System SHALL display an error message and allow retry

### Requirement 7: Order History

**User Story:** As a user, I want to view my order history, so that I can track my past and current orders.

#### Acceptance Criteria

1. WHEN a user navigates to the orders page, THE Order_System SHALL display a list of their orders
2. THE Order_System SHALL provide tabs to filter orders by status: all, pending, preparing, delivered, cancelled
3. THE Order_System SHALL display each order with: order number, date, total amount, and status badge
4. THE Order_System SHALL use color-coded badges for order status:
   - pending: yellow
   - confirmed: blue
   - preparing: orange
   - ready: purple
   - delivered: green
   - cancelled: red
5. WHEN a user clicks on an order, THE Order_System SHALL navigate to the order detail page
6. THE Order_System SHALL support pagination for orders list
7. WHILE orders are loading, THE Order_System SHALL display skeleton loading placeholders

### Requirement 8: User Wallet

**User Story:** As a user, I want to manage my wallet, so that I can view my balance and top up funds.

#### Acceptance Criteria

1. WHEN a user navigates to the wallet page, THE Payment_System SHALL display their current balance
2. WHEN the user is an employee, THE Payment_System SHALL display both personal and company wallet balances separately
3. THE Payment_System SHALL display a transaction history table with: type, amount, balance before/after, description, and date
4. WHEN a user clicks "شارژ کیف پول", THE Payment_System SHALL display a top-up form
5. WHEN a user submits a top-up request, THE Payment_System SHALL redirect to the payment gateway
6. THE Payment_System SHALL format all amounts in Persian number format with "تومان" suffix

### Requirement 9: User Profile Management

**User Story:** As a user, I want to manage my profile, so that I can update my personal information and addresses.

#### Acceptance Criteria

1. WHEN a user navigates to the profile page, THE Profile_System SHALL display tabs for: personal info, addresses, and settings
2. THE Profile_System SHALL display a form with: first name, last name, national code, birth date, and gender
3. WHEN a user updates their profile, THE Profile_System SHALL save changes and display a success message
4. THE Profile_System SHALL display a list of saved addresses
5. WHEN a user adds a new address, THE Profile_System SHALL display a form with: title, address, city, postal code, and default flag
6. WHEN a user sets an address as default, THE Profile_System SHALL update the default address
7. WHEN a user deletes an address, THE Profile_System SHALL remove it after confirmation

### Requirement 10: Route Protection and Authorization

**User Story:** As a system administrator, I want routes to be protected, so that users can only access pages they are authorized to view.

#### Acceptance Criteria

1. WHEN an unauthenticated user tries to access a protected route, THE Auth_System SHALL redirect them to the login page
2. WHEN an authenticated user tries to access a route outside their role permissions, THE Auth_System SHALL redirect them to their default dashboard
3. THE Auth_System SHALL check token validity on each protected route access
4. WHEN the access token expires, THE Auth_System SHALL attempt to refresh it using the refresh token
5. WHEN the refresh token is invalid or expired, THE Auth_System SHALL log out the user and redirect to login

### Requirement 11: RTL and Persian Localization

**User Story:** As a Persian-speaking user, I want the interface to be in Persian with RTL layout, so that I can use the system comfortably.

#### Acceptance Criteria

1. THE UI_System SHALL render all pages with RTL (right-to-left) direction
2. THE UI_System SHALL display all dates in Persian (Shamsi) calendar format
3. THE UI_System SHALL format all numbers in Persian format
4. THE UI_System SHALL display all prices with "تومان" suffix
5. THE UI_System SHALL display all labels, messages, and placeholders in Persian

### Requirement 12: Responsive Design

**User Story:** As a user, I want to use the system on any device, so that I can place orders from my phone or computer.

#### Acceptance Criteria

1. THE UI_System SHALL adapt layout for mobile screens (< 640px)
2. THE UI_System SHALL adapt layout for tablet screens (640px - 1024px)
3. THE UI_System SHALL adapt layout for desktop screens (> 1024px)
4. WHEN on mobile, THE UI_System SHALL convert the sidebar to a drawer/hamburger menu
5. WHEN on tablet, THE UI_System SHALL collapse the sidebar to icons only
