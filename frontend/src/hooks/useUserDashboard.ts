/**
 * User Dashboard Hook
 * هوک داشبورد کاربر
 * 
 * این هوک تمام داده‌های مورد نیاز داشبورد را با React Query دریافت می‌کند
 */

import { useQueries } from '@tanstack/react-query';
import { userService, UserProfile } from '@/services/user.service';
import { walletService, Wallet } from '@/services/wallet.service';
import { orderService, Order } from '@/services/order.service';

// Dashboard data types
export interface DashboardStats {
  walletBalance: number;
  companyBalance: number;
  totalBalance: number;
  activeOrdersCount: number;
  totalSpentThisMonth: number;
  totalOrdersCount: number;
}

export interface DashboardData {
  profile: UserProfile | null;
  wallet: Wallet | null;
  recentOrders: Order[];
  stats: DashboardStats;
}

export interface UseUserDashboardReturn {
  data: DashboardData;
  isLoading: boolean;
  isError: boolean;
  errors: {
    profile: Error | null;
    wallet: Error | null;
    orders: Error | null;
  };
  refetch: () => void;
}

// Active order statuses
const ACTIVE_ORDER_STATUSES = ['pending', 'confirmed', 'preparing', 'ready'];

/**
 * Calculate total spent this month from orders
 * محاسبه مجموع هزینه‌های این ماه از سفارشات
 */
function calculateMonthlySpent(orders: Order[]): number {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  return orders
    .filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= startOfMonth && order.status !== 'cancelled';
    })
    .reduce((total, order) => total + (order.userPayable || order.totalAmount || 0), 0);
}

/**
 * Custom hook for user dashboard data
 * هوک سفارشی برای داده‌های داشبورد کاربر
 * 
 * @example
 * ```tsx
 * const { data, isLoading, isError, refetch } = useUserDashboard();
 * 
 * if (isLoading) return <Skeleton />;
 * if (isError) return <Error />;
 * 
 * return (
 *   <div>
 *     <h1>سلام {data.profile?.firstName}</h1>
 *     <p>موجودی: {data.stats.totalBalance}</p>
 *   </div>
 * );
 * ```
 */
export function useUserDashboard(): UseUserDashboardReturn {
  // Fetch all data in parallel using useQueries
  const results = useQueries({
    queries: [
      {
        queryKey: ['user', 'profile'],
        queryFn: userService.getProfile,
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 2,
      },
      {
        queryKey: ['wallet', 'balance'],
        queryFn: walletService.getBalance,
        staleTime: 1 * 60 * 1000, // 1 minute
        retry: 2,
      },
      {
        queryKey: ['orders', 'recent', { limit: 10 }],
        queryFn: () => orderService.getOrders({ limit: 10 }),
        staleTime: 1 * 60 * 1000, // 1 minute
        retry: 2,
      },
    ],
  });

  const [profileQuery, walletQuery, ordersQuery] = results;

  // Extract data
  const profile = profileQuery.data || null;
  const wallet = walletQuery.data || null;
  const orders = ordersQuery.data?.data || [];

  // Calculate stats
  const activeOrdersCount = orders.filter(
    order => ACTIVE_ORDER_STATUSES.includes(order.status)
  ).length;

  const totalSpentThisMonth = calculateMonthlySpent(orders);

  const stats: DashboardStats = {
    walletBalance: wallet?.personalBalance || 0,
    companyBalance: wallet?.companyBalance || 0,
    totalBalance: wallet?.totalBalance || (wallet?.personalBalance || 0) + (wallet?.companyBalance || 0),
    activeOrdersCount,
    totalSpentThisMonth,
    totalOrdersCount: ordersQuery.data?.pagination?.total || orders.length,
  };

  // Combined loading state
  const isLoading = results.some(query => query.isLoading);
  
  // Combined error state
  const isError = results.some(query => query.isError);

  // Refetch all queries
  const refetch = () => {
    results.forEach(query => query.refetch());
  };

  return {
    data: {
      profile,
      wallet,
      recentOrders: orders.slice(0, 5),
      stats,
    },
    isLoading,
    isError,
    errors: {
      profile: profileQuery.error as Error | null,
      wallet: walletQuery.error as Error | null,
      orders: ordersQuery.error as Error | null,
    },
    refetch,
  };
}

export default useUserDashboard;
