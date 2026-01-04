# Implementation Plan: Frontend Phase 1 MVP

## Overview

این برنامه پیاده‌سازی فاز 1 (MVP) فرانت‌اند سامانه کترینگ سازمانی را شرح می‌دهد. پیاده‌سازی با TypeScript، Next.js 14، و Tailwind CSS انجام می‌شود.

## Tasks

- [x] 1. Setup and Core Infrastructure
  - [x] 1.1 Setup utility functions and formatters
    - Create `formatPrice` function for Persian price formatting with تومان suffix
    - Create `formatPersianDate` function using jalali-moment
    - Create `formatPersianNumber` function for number localization
    - _Requirements: 11.2, 11.3, 11.4, 8.6_
  - [ ]* 1.2 Write property tests for formatting functions
    - **Property 5: Persian Date Formatting**
    - **Property 14: Price Formatting**
    - **Validates: Requirements 11.2, 11.4, 8.6**
  - [x] 1.3 Setup Zod validation schemas
    - Create loginSchema with email and password validation
    - Create registerSchema with phone, password match validation
    - _Requirements: 1.5, 1.6, 1.7, 2.4, 2.5_
  - [ ]* 1.4 Write property tests for validation schemas
    - **Property 1: Login Form Validation**
    - **Property 3: Phone Number Validation**
    - **Property 4: Password Match Validation**
    - **Validates: Requirements 1.6, 1.7, 2.4, 2.5**

- [x] 2. Authentication Module
  - [x] 2.1 Create auth API service
    - Implement login, register, forgotPassword, refreshToken functions
    - Setup axios interceptors for token handling
    - _Requirements: 1.2, 2.2, 3.2, 10.4_
  - [x] 2.2 Enhance auth store
    - Add role-based redirect logic
    - Implement token refresh mechanism
    - _Requirements: 1.3, 10.3, 10.4, 10.5_

  - [ ]* 2.3 Write property test for role-based redirect
    - **Property 2: Role-Based Redirect**
    - **Validates: Requirements 1.3**
  - [x] 2.4 Create LoginForm component
    - Implement form with React Hook Form and Zod
    - Add loading state and error handling
    - _Requirements: 1.1, 1.4, 1.8_
  - [x] 2.5 Create RegisterForm component
    - Implement form with role selection
    - Add validation and error handling
    - _Requirements: 2.1, 2.3, 2.6, 2.7_
  - [x] 2.6 Create ForgotPasswordForm component
    - Implement email submission form
    - _Requirements: 3.1, 3.2, 3.3_
  - [x] 2.7 Create auth pages (login, register, forgot-password)
    - Setup page layouts with auth forms
    - _Requirements: 1.1, 2.1, 3.1_

- [x] 3. Route Protection
  - [x] 3.1 Create auth middleware
    - Implement route protection logic
    - Add role-based access control
    - _Requirements: 10.1, 10.2, 10.3_
  - [ ]* 3.2 Write property test for route protection
    - **Property 15: Route Protection**
    - **Validates: Requirements 10.1, 10.2**

- [x] 4. Checkpoint - Auth Module Complete
  - Ensure all auth tests pass, ask the user if questions arise.

- [x] 5. Menu Module
  - [x] 5.1 Create menu API service
    - Implement getDailyMenu and getCategories functions
    - _Requirements: 4.3_
  - [x] 5.2 Create FoodCard component
    - Display food item with image, name, price, attributes
    - Add "افزودن به سبد" button
    - Handle unavailable items (quantity = 0)
    - _Requirements: 4.4, 4.5, 4.7_
  - [ ]* 5.3 Write property test for FoodCard display
    - **Property 6: Food Item Display Completeness**
    - **Validates: Requirements 4.4**
  - [x] 5.4 Create MenuFilter component
    - Implement meal type filter (breakfast, lunch, dinner)
    - _Requirements: 4.6_
  - [x] 5.5 Create menu page
    - Display Persian date header
    - Implement responsive grid layout
    - Add skeleton loading states
    - _Requirements: 4.1, 4.2, 4.8_

- [x] 6. Cart Module
  - [x] 6.1 Enhance cart store
    - Implement addItem with quantity increment logic
    - Implement updateQuantity with zero-removal
    - Add getSubtotal and getTotalItems selectors
    - _Requirements: 5.1, 5.2, 5.5, 5.6_
  - [ ]* 6.2 Write property tests for cart operations
    - **Property 7: Cart Item Addition**
    - **Property 8: Cart Persistence Round-Trip**
    - **Property 9: Cart Total Calculation**
    - **Validates: Requirements 5.1, 5.2, 5.3, 5.5**

  - [x] 6.3 Create CartItem component
    - Display item with quantity selector
    - Add remove button
    - _Requirements: 5.4_
  - [x] 6.4 Create CartSummary component
    - Display subtotal, subsidy (for employees), total payable
    - _Requirements: 5.7_
  - [x] 6.5 Create cart page
    - Display cart items list
    - Show empty state when cart is empty
    - Add checkout button
    - _Requirements: 5.4, 5.8_

- [x] 7. Checkpoint - Menu and Cart Complete
  - Ensure all menu and cart tests pass, ask the user if questions arise.

- [x] 8. Order Module
  - [x] 8.1 Create order API service
    - Implement create, getMyOrders, getOrderById functions
    - _Requirements: 6.8, 7.1_
  - [x] 8.2 Create CheckoutStepper component
    - Implement multi-step progress indicator
    - _Requirements: 6.1_
  - [x] 8.3 Create AddressSelector component
    - Display saved addresses with selection
    - Add new address option
    - _Requirements: 6.2_
  - [x] 8.4 Create DateSelector component
    - Implement delivery date picker
    - _Requirements: 6.3_

  - [x] 8.5 Create OrderSummary component
    - Display items, subtotal, subsidy, total
    - _Requirements: 6.4_
  - [ ]* 8.6 Write property test for order summary calculation
    - **Property 10: Order Summary Calculation**
    - **Validates: Requirements 6.4**
  - [x] 8.7 Create PaymentMethodSelector component
    - Display wallet and online payment options
    - Show wallet balance
    - _Requirements: 6.5_
  - [x] 8.8 Create checkout page
    - Implement multi-step checkout flow
    - Handle payment redirect
    - Clear cart on success
    - _Requirements: 6.1, 6.6, 6.7, 6.8, 6.9_
  - [x] 8.9 Create OrderStatusBadge component
    - Implement color-coded status badges
    - _Requirements: 7.4_
  - [x] 8.10 Create OrderCard component
    - Display order number, date, amount, status
    - _Requirements: 7.3_
  - [ ]* 8.11 Write property test for order display
    - **Property 11: Order Display with Status Badges**
    - **Validates: Requirements 7.3, 7.4**
  - [x] 8.12 Create orders list page
    - Implement status filter tabs
    - Add pagination
    - Show skeleton loading
    - _Requirements: 7.1, 7.2, 7.5, 7.6, 7.7_
  - [x] 8.13 Create order detail page
    - Display full order information
    - _Requirements: 7.5_

- [x] 9. Checkpoint - Order Module Complete
  - Ensure all order tests pass, ask the user if questions arise.

- [x] 10. Wallet Module
  - [x] 10.1 Create wallet API service
    - Implement getBalance, getTransactions, topup functions
    - _Requirements: 8.1, 8.3, 8.4_
  - [x] 10.2 Create WalletBalance component
    - Display personal and company balances
    - Handle employee vs personal user display
    - _Requirements: 8.1, 8.2_
  - [ ]* 10.3 Write property test for wallet balance display
    - **Property 12: Wallet Balance Display**
    - **Validates: Requirements 8.1, 8.2**
  - [x] 10.4 Create TransactionTable component
    - Display transaction history with all fields
    - _Requirements: 8.3_
  - [ ]* 10.5 Write property test for transaction display
    - **Property 13: Transaction History Display**
    - **Validates: Requirements 8.3**
  - [x] 10.6 Create TopupForm component
    - Implement amount input and submit
    - _Requirements: 8.4, 8.5_
  - [x] 10.7 Create wallet page
    - Combine balance, transactions, and topup
    - _Requirements: 8.1, 8.3, 8.4_

- [x] 11. Profile Module
  - [x] 11.1 Create user API service
    - Implement profile and address CRUD functions
    - _Requirements: 9.2, 9.4_
  - [x] 11.2 Create ProfileForm component
    - Implement personal info form
    - _Requirements: 9.2, 9.3_
  - [x] 11.3 Create AddressForm component
    - Implement address form with all fields
    - _Requirements: 9.5_
  - [x] 11.4 Create AddressList component
    - Display saved addresses
    - Add default selection and delete
    - _Requirements: 9.4, 9.6, 9.7_
  - [x] 11.5 Create profile page
    - Implement tabs for personal info, addresses, settings
    - _Requirements: 9.1_

- [x] 12. Layout and Responsive Design
  - [x] 12.1 Create Sidebar component
    - Implement navigation menu
    - Add role-based menu items
    - _Requirements: 12.4, 12.5_
  - [x] 12.2 Create Header component
    - Display user info and cart icon
    - Add mobile menu toggle
    - _Requirements: 12.1_
  - [x] 12.3 Create MobileNav component
    - Implement drawer navigation for mobile (integrated in Sidebar)
    - _Requirements: 12.4_
  - [x] 12.4 Create dashboard layout
    - Combine sidebar, header, and content area
    - Implement responsive breakpoints
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

- [x] 13. Final Integration and Testing
  - [x] 13.1 Wire all components together
    - Ensure all pages use correct layouts
    - Verify navigation flows
    - _Requirements: All_
  - [x] 13.2 Verify RTL and Persian localization
    - Check all text is in Persian
    - Verify RTL layout on all pages
    - _Requirements: 11.1, 11.5_
  - [ ]* 13.3 Run all property tests
    - Ensure all 15 properties pass
    - _Requirements: All testable requirements_

- [x] 14. Final Checkpoint
  - All components implemented and verified, no TypeScript errors.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- Testing framework: Jest + fast-check for property-based testing
