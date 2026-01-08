# Phase 4b Implementation: Company Admin - Finance & Subsidy

## Overview
This phase implements the financial management features for company administrators, including subsidy rule configuration and company wallet management.

## Implemented Features

### 1. Subsidy Rules Management (`/company/subsidy-rules`)

#### Features:
- **List View**: Display all subsidy rules with visual cards
- **Create/Edit Modal**: Form to create or edit subsidy rules
- **Delete Confirmation**: Safe deletion with confirmation modal
- **Rule Types**:
  - **Percentage**: Subsidy as a percentage of order amount
  - **Fixed**: Fixed amount subsidy per order
  - **Tiered**: Multi-level subsidy based on order amount
- **Rule Configuration**:
  - Name: Descriptive name for the rule
  - Type: Percentage, Fixed, or Tiered
  - Value: The subsidy amount or percentage
  - Max Amount: Optional maximum subsidy cap
  - Min Order Amount: Optional minimum order requirement
  - Meal Types: Optional filter (Breakfast, Lunch, Dinner)
  - Categories: Optional category filter
  - Priority: Rule application order
  - Active Status: Enable/disable rule

#### UI Components:
- Color-coded rule cards by type (Primary for %, Success for Fixed, Warning for Tiered)
- Badge indicators for active/inactive status
- Icon-based type indicators (Percent, DollarSign, Tag)
- Responsive grid layout
- Empty state with call-to-action

#### API Integration:
- `GET /api/v1/companies/{id}/subsidy-rules` - Fetch all rules
- `POST /api/v1/companies/{id}/subsidy-rules` - Create new rule
- `PATCH /api/v1/companies/{id}/subsidy-rules/{ruleId}` - Update rule
- `DELETE /api/v1/companies/{id}/subsidy-rules/{ruleId}` - Delete rule

### 2. Company Wallet Management (`/company/wallet`)

#### Features:
- **Balance Display**: Large prominent card showing company wallet balance
- **Top-up Functionality**: 
  - Quick amount buttons (500K, 1M, 2M, 5M)
  - Custom amount input
  - Payment gateway integration
  - Minimum amount validation (100,000 Toman)
- **Statistics Cards**:
  - Total Credits (all deposits)
  - Total Debits (all withdrawals)
  - Open Invoices count
- **Tabbed Interface**:
  - Transactions tab
  - Invoices tab

#### Transactions Tab:
- List of all company wallet transactions
- Transaction type indicators with icons
- Color-coded amounts (green for credits, red for debits)
- Balance after each transaction
- Timestamp in Jalali format
- Transaction descriptions

#### Invoices Tab:
- List of company invoices
- Invoice number display
- Status badges (Paid, Pending, Cancelled)
- Amount display
- Download button (placeholder)
- Creation date in Jalali format

#### UI Components:
- Gradient balance card (Primary gradient)
- Icon-based transaction indicators
- Tab navigation
- Empty states for both tabs
- Responsive layout

#### API Integration:
- `GET /api/v1/wallets/balance` - Fetch wallet balance
- `GET /api/v1/companies/{id}/wallet/transactions` - Fetch transactions
- `GET /api/v1/invoices/company/{id}` - Fetch invoices
- `POST /api/v1/companies/{id}/wallet/topup` - Initiate top-up

## Technical Implementation

### State Management:
- React Hook Form with Zod validation
- TanStack Query for data fetching and caching
- Local state for modals and UI interactions

### Form Validation:
- Subsidy Rule Schema:
  - Name: Required string
  - Type: Enum (percentage, fixed, tiered)
  - Value: Positive number
  - Optional fields with proper types
- Top-up Schema:
  - Amount: Minimum 100,000 Toman

### UI Patterns:
- Modal-based forms for create/edit operations
- Confirmation modals for destructive actions
- Loading states with skeletons
- Empty states with helpful messages
- Toast notifications for user feedback

### Responsive Design:
- Mobile-first approach
- Grid layouts that adapt to screen size
- Horizontal scrolling for tables on mobile
- Touch-friendly button sizes

### Persian (RTL) Support:
- Right-to-left layout
- Persian number formatting with `toPersianDigits()`
- Jalali date formatting with `toJalali()`
- Persian labels and messages

## File Structure

```
frontend/src/app/company/
├── subsidy-rules/
│   └── page.tsx          # Subsidy rules management page
└── wallet/
    └── page.tsx          # Company wallet page

frontend/src/services/
└── company.service.ts    # Updated with new API functions
```

## API Types Added to company.service.ts

```typescript
interface SubsidyRule {
  id: string;
  companyId: string;
  name: string;
  type: 'percentage' | 'fixed' | 'tiered';
  value: number;
  maxAmount?: number;
  minOrderAmount?: number;
  mealTypes?: string[];
  categories?: string[];
  isActive: boolean;
  priority: number;
  validFrom?: string;
  validTo?: string;
  createdAt: string;
  updatedAt: string;
}

interface CreateSubsidyRuleRequest {
  name: string;
  type: 'percentage' | 'fixed' | 'tiered';
  value: number;
  maxAmount?: number;
  minOrderAmount?: number;
  mealTypes?: string[];
  categories?: string[];
  isActive?: boolean;
  priority?: number;
  validFrom?: string;
  validTo?: string;
}

interface CompanyInvoice {
  id: string;
  companyId: string;
  invoiceNumber: string;
  type: 'topup' | 'subsidy' | 'order';
  amount: number;
  status: 'pending' | 'paid' | 'cancelled';
  dueDate?: string;
  paidAt?: string;
  description?: string;
  items?: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface CompanyWalletTransaction {
  id: string;
  companyId: string;
  type: string;
  typeLabel: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  referenceType?: string;
  referenceId?: string;
  description?: string;
  createdAt: string;
}
```

## Testing Guide

### Subsidy Rules Page:
1. Navigate to `/company/subsidy-rules`
2. Click "افزودن قانون جدید" to open create modal
3. Fill in rule details:
   - Enter rule name
   - Select type (Percentage/Fixed/Tiered)
   - Enter value
   - Optionally set max amount and min order amount
   - Select meal types if needed
   - Set priority
   - Toggle active status
4. Submit form and verify rule appears in list
5. Click edit icon to modify rule
6. Click delete icon and confirm to remove rule
7. Verify empty state when no rules exist

### Company Wallet Page:
1. Navigate to `/company/wallet`
2. Verify balance card displays correct amount
3. Click "شارژ کیف پول" to open top-up modal
4. Test quick amount buttons
5. Enter custom amount
6. Submit and verify payment gateway redirect (or success message)
7. Switch between Transactions and Invoices tabs
8. Verify transaction list with proper formatting
9. Verify invoice list with status badges
10. Test empty states for both tabs

## Integration Points

### With Backend APIs:
- All endpoints follow RESTful conventions
- Proper error handling with toast notifications
- Loading states during API calls
- Automatic cache invalidation after mutations

### With Other Features:
- Links from company dashboard to these pages
- Subsidy rules affect employee order calculations
- Wallet balance affects company's ability to provide subsidies
- Transactions reflect all company financial activities

## Future Enhancements

1. **Subsidy Rules**:
   - Bulk import/export of rules
   - Rule templates
   - Advanced tiered configuration UI
   - Rule effectiveness analytics
   - Date range picker for validity period

2. **Company Wallet**:
   - Invoice PDF download
   - Transaction filtering and search
   - Export transactions to Excel
   - Scheduled top-ups
   - Low balance alerts
   - Detailed transaction breakdown
   - Budget forecasting

3. **General**:
   - Audit logs for rule changes
   - Approval workflow for large top-ups
   - Multi-currency support
   - Integration with accounting systems

## Notes

- All monetary values are in Toman (Iranian currency)
- Minimum top-up amount is 100,000 Toman for company wallet
- Subsidy rules are applied based on priority order
- Multiple rules can be active simultaneously
- Payment gateway integration requires proper configuration
- All dates use Jalali calendar
- All numbers use Persian digits
- RTL layout throughout

## Completion Status

✅ Subsidy Rules Management Page
✅ Company Wallet Page
✅ API Integration
✅ Form Validation
✅ Loading States
✅ Empty States
✅ Error Handling
✅ Responsive Design
✅ Persian/RTL Support
✅ Documentation

**Phase 4b is complete and ready for testing.**
