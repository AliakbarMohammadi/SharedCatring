// User & Auth Types
export type UserRole = "super_admin" | "company_admin" | "personal_user" | "kitchen_staff";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  status: "active" | "inactive" | "suspended";
  companyId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
}

// Company Types
export interface Company {
  id: string;
  name: string;
  nationalId: string;
  economicCode?: string;
  phone?: string;
  address?: string;
  adminUserId: string;
  status: "active" | "inactive";
  createdAt: string;
}

export interface Department {
  id: string;
  companyId: string;
  name: string;
  code: string;
}

export interface Employee {
  id: string;
  userId: string;
  companyId: string;
  employeeCode: string;
  departmentId?: string;
  position?: string;
  user?: User;
}

export interface SubsidyRule {
  id: string;
  companyId: string;
  name: string;
  type: "percentage" | "fixed";
  value: number;
  maxAmount?: number;
  mealTypes: string[];
  isActive: boolean;
}

// Menu Types
export interface Category {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  order: number;
  children?: Category[];
}

export interface FoodItem {
  id: string;
  name: string;
  description?: string;
  categoryId: string;
  imageUrl?: string;
  pricing: {
    basePrice: number;
  };
  preparationTime?: number;
  isAvailable: boolean;
  isFeatured?: boolean;
  nutrition?: NutritionInfo;
}

export interface NutritionInfo {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

export interface MenuSchedule {
  id: string;
  date: string;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  items: ScheduleItem[];
  orderDeadline: string;
}

export interface ScheduleItem {
  foodId: string;
  food?: FoodItem;
  maxQuantity: number;
  remainingQuantity?: number;
}

// Order Types
export interface CartItem {
  id: string;
  foodId: string;
  foodName: string;
  quantity: number;
  unitPrice: number;
  imageUrl?: string;
}

export interface Order {
  id: string;
  userId: string;
  orderNumber: string;
  orderType: "personal" | "corporate";
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  deliveryDate: string;
  deliveryAddress?: DeliveryAddress;
  companyId?: string;
  createdAt: string;
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "delivered"
  | "cancelled";

export interface OrderItem {
  foodId: string;
  foodName: string;
  quantity: number;
  unitPrice: number;
}

export interface DeliveryAddress {
  address: string;
  city?: string;
  postalCode?: string;
}

// Reservation Types
export interface Reservation {
  id: string;
  userId: string;
  weekStartDate: string;
  status: "active" | "cancelled";
  items: ReservationItem[];
}

export interface ReservationItem {
  date: string;
  mealType: string;
  foodId: string;
  quantity: number;
}

// Wallet Types
export interface Wallet {
  userId: string;
  balance: number;
  subsidyBalance: number;
  lastUpdated: string;
}

export interface WalletTransaction {
  id: string;
  type: "credit" | "debit";
  amount: number;
  description: string;
  createdAt: string;
}

// Payment Types
export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  status: "pending" | "completed" | "failed" | "refunded";
  gateway: string;
  trackingCode?: string;
  createdAt: string;
}

// Invoice Types
export interface Invoice {
  id: string;
  invoiceNumber: string;
  type: "instant" | "consolidated";
  status: "draft" | "issued" | "paid" | "cancelled";
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  customerName: string;
  createdAt: string;
}

export interface InvoiceItem {
  orderId?: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  type: "in_app" | "email" | "sms";
  category: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
