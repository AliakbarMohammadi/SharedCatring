# Phase 2 Testing Guide - Personal User Panel

## Quick Start

### 1. Start the Application
```bash
# Terminal 1: Start backend services
docker-compose up -d

# Terminal 2: Start frontend
cd frontend
npm run dev
```

### 2. Access Points
- Frontend: http://localhost:4001
- Backend API: http://localhost:3000
- API Docs: http://localhost:3000/api-docs

## Test Scenarios

### Scenario 1: Complete Order Flow (Happy Path)

#### Step 1: Login
1. Go to http://localhost:4001/auth/login
2. Use demo credentials:
   - Email: `ali.mohammadi@example.com`
   - Password: `Ali@123456`
3. ✅ Should redirect to `/dashboard`

#### Step 2: Browse Menu
1. Click "مشاهده منو" (View Menu) from dashboard
2. Or go to http://localhost:4001/menu
3. Browse food items
4. Filter by category
5. Search for specific food
6. ✅ Menu items should display with images and prices

#### Step 3: Add to Cart
1. Click "افزودن" (Add) on any food item
2. ✅ Toast notification: "{Food Name} به سبد خرید اضافه شد"
3. ✅ Cart icon in header should show item count
4. Add multiple items with different quantities
5. ✅ Cart count should update

#### Step 4: View Cart
1. Click cart icon in header
2. Or go to http://localhost:4001/cart
3. ✅ All added items should be visible
4. Test quantity controls:
   - Click + to increase
   - Click - to decrease
   - ✅ Total should update automatically
5. Test remove item:
   - Click trash icon
   - ✅ Item should be removed
   - ✅ Toast: "آیتم از سبد خرید حذف شد"

#### Step 5: Apply Promo Code (Optional)
1. In cart page, find promo code input
2. Enter: `TEST10`
3. Click "اعمال" (Apply)
4. ✅ If valid: Green success message and discount applied
5. ✅ If invalid: Red error message
6. ✅ Discount should reflect in order summary

#### Step 6: Checkout - Step 1 (Delivery Info)
1. Click "ادامه و تکمیل سفارش" (Continue to Checkout)
2. ✅ Should redirect to `/checkout`
3. ✅ Progress indicator shows Step 1 active
4. Fill delivery information:
   - **Address:** "تهران، خیابان ولیعصر، پلاک ۱۲۳"
   - **Date:** Select tomorrow's date
   - **Time Slot:** Click on "۱۲:۰۰ - ۱۳:۰۰"
   - **Notes (Optional):** "لطفاً زنگ بزنید"
5. ✅ Selected time slot should highlight
6. Click "ادامه" (Continue)
7. ✅ Should move to Step 2

#### Step 7: Checkout - Step 2 (Payment Method)
1. ✅ Progress indicator shows Step 2 active
2. Review payment options:
   - **Wallet:** Shows personal balance
   - **Company Subsidy:** Shows company balance (if corporate user)
   - **Online Payment:** Always available
3. Select payment method:
   - If balance sufficient: Select "کیف پول" (Wallet)
   - Otherwise: Select "پرداخت آنلاین" (Online)
4. ✅ Selected method should highlight with checkmark
5. Click "ادامه" (Continue)
6. ✅ Should move to Step 3

#### Step 8: Checkout - Step 3 (Confirmation)
1. ✅ Progress indicator shows Step 3 active
2. Review all order details:
   - ✅ Delivery address matches input
   - ✅ Delivery date matches selection
   - ✅ Time slot matches selection
   - ✅ Payment method matches selection
3. Review order summary sidebar:
   - ✅ All items listed
   - ✅ Quantities correct
   - ✅ Total amount correct
4. Click "ثبت سفارش" (Submit Order)
5. ✅ Loading indicator should show
6. ✅ Success toast: "سفارش شما با موفقیت ثبت شد"
7. ✅ Should redirect to `/orders/{orderId}`
8. ✅ Cart should be empty

#### Step 9: View Order Details
1. ✅ Order detail page should load
2. Verify order information:
   - ✅ Order number displayed
   - ✅ Status badge shows "در انتظار" (Pending)
   - ✅ Status timeline shows current step
   - ✅ Delivery info matches input
   - ✅ All items listed correctly
   - ✅ Total amount correct
3. ✅ "لغو سفارش" (Cancel Order) button should be visible

#### Step 10: View Order History
1. Go to http://localhost:4001/orders
2. ✅ New order should appear in list
3. Test filters:
   - Click "در انتظار" (Pending)
   - ✅ Only pending orders should show
   - Click "همه" (All)
   - ✅ All orders should show
4. Click on any order
5. ✅ Should navigate to order detail page

### Scenario 2: Wallet Management

#### Step 1: View Wallet
1. Go to http://localhost:4001/wallet
2. ✅ Three balance cards should display:
   - Total Balance (gradient card)
   - Personal Balance
   - Company Subsidy
3. ✅ Transaction history should load

#### Step 2: Top-Up Wallet
1. Click "شارژ کیف پول" (Charge Wallet)
2. ✅ Modal should open
3. Test quick amounts:
   - Click "۵۰,۰۰۰ تومان"
   - ✅ Amount should highlight
   - ✅ Input field should update
4. Test custom amount:
   - Clear input
   - Enter: `75000`
   - ✅ Quick amount selection should clear
5. Click "پرداخت و شارژ" (Pay and Charge)
6. ✅ Should redirect to payment gateway (or show success if mocked)

#### Step 3: View Transactions
1. Scroll to transaction history
2. ✅ Recent transactions should display
3. Verify transaction details:
   - ✅ Type icon (green for credit, red for debit)
   - ✅ Transaction label in Persian
   - ✅ Date in Jalali format
   - ✅ Amount with +/- sign
   - ✅ Color coding matches type

### Scenario 3: Dashboard Widgets

#### Step 1: View Dashboard
1. Go to http://localhost:4001/dashboard
2. ✅ Greeting should show user's first name
3. ✅ Current Persian date should display

#### Step 2: Check Stats Cards
1. ✅ Wallet balance card shows correct amount
2. ✅ Active orders count is accurate
3. ✅ Company subsidy shows (if corporate user)
4. ✅ Monthly spent calculates correctly

#### Step 3: Quick Order
1. Scroll to "سفارش سریع" (Quick Order) section
2. ✅ Today's menu items should display (if published)
3. Click "افزودن" (Add) on any item
4. ✅ Toast: "{Food Name} به سبد خرید اضافه شد"
5. ✅ Item should be added to cart

#### Step 4: Recent Orders
1. Check "سفارشات اخیر" (Recent Orders) section
2. ✅ Last 5 orders should display
3. Click on any order
4. ✅ Should navigate to order detail

#### Step 5: Quick Actions
1. Check sidebar "دسترسی سریع" (Quick Access)
2. Test each button:
   - ✅ "مشاهده منو" → `/menu`
   - ✅ "تاریخچه سفارشات" → `/orders`
   - ✅ "ویرایش پروفایل" → `/profile`
   - ✅ "کیف پول" → `/wallet`

### Scenario 4: Order Cancellation

#### Step 1: Find Pending Order
1. Go to http://localhost:4001/orders
2. Filter by "در انتظار" (Pending)
3. Click on a pending order

#### Step 2: Cancel Order
1. ✅ "لغو سفارش" (Cancel Order) button should be visible
2. Click "لغو سفارش"
3. ✅ Confirmation modal should open
4. Click "بله، لغو شود" (Yes, Cancel)
5. ✅ Loading indicator should show
6. ✅ Success toast: "سفارش با موفقیت لغو شد"
7. ✅ Status should update to "لغو شده" (Cancelled)
8. ✅ Status timeline should show cancelled state
9. ✅ Cancel button should disappear

### Scenario 5: Reorder

#### Step 1: Find Completed Order
1. Go to http://localhost:4001/orders
2. Filter by "تحویل شده" (Delivered) or "تکمیل شده" (Completed)
3. Click on a completed order

#### Step 2: Reorder
1. ✅ "سفارش مجدد" (Reorder) button should be visible
2. Click "سفارش مجدد"
3. ✅ Loading indicator should show
4. ✅ Success toast: "آیتم‌ها به سبد خرید اضافه شدند"
5. ✅ Should redirect to `/cart`
6. ✅ All items from original order should be in cart

### Scenario 6: Empty States

#### Test Empty Cart
1. Clear all items from cart
2. Go to http://localhost:4001/cart
3. ✅ Empty state should display:
   - Shopping bag icon
   - "سبد خرید شما خالی است"
   - "مشاهده منو" button

#### Test Empty Orders
1. With a new user (no orders)
2. Go to http://localhost:4001/orders
3. ✅ Empty state should display:
   - Clipboard icon
   - "هنوز سفارشی ثبت نکرده‌اید"
   - "مشاهده منو" button

#### Test Empty Transactions
1. With a new user (no transactions)
2. Go to http://localhost:4001/wallet
3. Scroll to transactions
4. ✅ Empty state should display:
   - Wallet icon
   - "تراکنشی وجود ندارد"

### Scenario 7: Responsive Design

#### Test Mobile View
1. Open DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Select "iPhone 12 Pro"
4. Test all pages:
   - ✅ Dashboard: Cards stack vertically
   - ✅ Menu: Grid adjusts to 1-2 columns
   - ✅ Cart: Items stack properly
   - ✅ Checkout: Steps remain visible
   - ✅ Orders: Cards are touch-friendly
   - ✅ Wallet: Balance cards stack

#### Test Tablet View
1. Select "iPad"
2. Test all pages:
   - ✅ Dashboard: 2-column layout
   - ✅ Menu: 2-3 column grid
   - ✅ Cart: Sidebar stacks below
   - ✅ Checkout: Sidebar remains
   - ✅ Orders: 2-column cards

### Scenario 8: Error Handling

#### Test Insufficient Balance
1. Add expensive items to cart (total > wallet balance)
2. Go to checkout
3. Select "کیف پول" (Wallet) payment
4. ✅ Wallet option should be disabled
5. ✅ Error message: "موجودی کافی نیست"

#### Test Invalid Promo Code
1. In cart, enter invalid code: `INVALID123`
2. Click "اعمال" (Apply)
3. ✅ Error toast: "کد تخفیف نامعتبر است"

#### Test Form Validation
1. In checkout Step 1, leave address empty
2. Click "ادامه" (Continue)
3. ✅ Error message: "آدرس باید حداقل ۱۰ کاراکتر باشد"

#### Test Network Error
1. Stop backend services
2. Try to load dashboard
3. ✅ Error toast should show
4. ✅ Retry mechanism should work

## Checklist

### Dashboard ✅
- [ ] Greeting displays user name
- [ ] Persian date shows correctly
- [ ] Wallet balance loads
- [ ] Active orders count accurate
- [ ] Recent orders table displays
- [ ] Quick order section works
- [ ] Quick actions navigate correctly
- [ ] Today's menu preview loads
- [ ] Refresh button updates data

### Cart ✅
- [ ] Items display with images
- [ ] Quantity controls work
- [ ] Remove item works
- [ ] Clear cart works
- [ ] Promo code validation works
- [ ] Totals calculate correctly
- [ ] Continue to checkout works
- [ ] Empty state displays

### Checkout ✅
- [ ] Progress indicator works
- [ ] Step 1: Address input validates
- [ ] Step 1: Date picker works
- [ ] Step 1: Time slots selectable
- [ ] Step 2: Payment methods display
- [ ] Step 2: Balance checks work
- [ ] Step 3: Review shows all details
- [ ] Submit order works
- [ ] Success redirect works
- [ ] Cart clears after order

### Orders ✅
- [ ] Order list displays
- [ ] Status filters work
- [ ] Pagination works
- [ ] Order detail loads
- [ ] Status timeline displays
- [ ] Delivery info shows
- [ ] Items list complete
- [ ] Cancel order works
- [ ] Reorder works
- [ ] Empty states display

### Wallet ✅
- [ ] Balance cards display
- [ ] Top-up modal opens
- [ ] Quick amounts work
- [ ] Custom amount validates
- [ ] Submit top-up works
- [ ] Transactions list loads
- [ ] Transaction types correct
- [ ] Amounts color-coded
- [ ] Empty state displays

### General ✅
- [ ] RTL layout works
- [ ] Persian text displays
- [ ] Jalali dates format
- [ ] Persian digits show
- [ ] Loading states work
- [ ] Error messages show
- [ ] Toast notifications work
- [ ] Responsive design works
- [ ] Navigation works
- [ ] Back buttons work

## Common Issues & Solutions

### Issue: Cart items disappear after refresh
**Solution:** Check localStorage in DevTools → Application → Local Storage → `catering-cart`

### Issue: Order not showing in history
**Solution:** Check order status filter, try "همه" (All)

### Issue: Payment method disabled
**Solution:** Check wallet balance, may need to top-up first

### Issue: Promo code not working
**Solution:** Ensure backend promotion service is running and code exists in database

### Issue: Images not loading
**Solution:** Check NEXT_PUBLIC_API_URL in `.env.local` and ensure file service is running

### Issue: Date picker not working
**Solution:** Use Chrome/Edge, Safari has limited HTML5 date input support

## Performance Checks

### Load Times
- [ ] Dashboard loads < 2 seconds
- [ ] Menu page loads < 2 seconds
- [ ] Cart page loads < 1 second
- [ ] Checkout page loads < 1 second
- [ ] Order detail loads < 1 second

### Interactions
- [ ] Add to cart responds < 500ms
- [ ] Quantity update responds < 200ms
- [ ] Filter change responds < 500ms
- [ ] Page navigation < 1 second

## Browser Compatibility

Test in:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

## Accessibility Checks

- [ ] Keyboard navigation works
- [ ] Tab order is logical
- [ ] Focus indicators visible
- [ ] Screen reader compatible
- [ ] Color contrast sufficient
- [ ] Touch targets ≥ 44px

## Final Verification

Before marking Phase 2 complete:
- [ ] All test scenarios pass
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] All API calls work
- [ ] All pages responsive
- [ ] All features functional
- [ ] Documentation complete
- [ ] Code reviewed

## Report Issues

If you find any issues:
1. Note the exact steps to reproduce
2. Include browser and OS version
3. Attach screenshots if applicable
4. Check browser console for errors
5. Report to development team

---

**Happy Testing! 🎉**
