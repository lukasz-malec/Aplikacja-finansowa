import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

interface MonthlySummary {
  month: number;
  year: number;
  totalIncome: number;
  totalExpenses: number;
  balance: number;
}

interface CategorySpending {
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  amount: number;
}

interface TrendItem {
  month: number;
  year: number;
  totalIncome: number;
  totalExpenses: number;
  balance: number;
}

export function useMonthlySummary(month: number, year: number) {
  return useQuery({
    queryKey: ["analytics", "summary", month, year],
    queryFn: () => api.get<MonthlySummary>(`/analytics/summary?month=${month}&year=${year}`),
  });
}

export function useSpendingByCategory(month: number, year: number) {
  return useQuery({
    queryKey: ["analytics", "spending", month, year],
    queryFn: () =>
      api.get<{ spending: CategorySpending[] }>(`/analytics/spending-by-category?month=${month}&year=${year}`),
  });
}

export function useMonthlyTrend(months: number = 6) {
  return useQuery({
    queryKey: ["analytics", "trend", months],
    queryFn: () => api.get<{ trend: TrendItem[] }>(`/analytics/trend?months=${months}`),
  });
}