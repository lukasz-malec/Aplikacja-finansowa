import { linearRegression, linearRegressionLine } from "simple-statistics";
import { prisma } from "../../lib/prisma";
import { Category } from "../categories/category.model";

export interface MonthlySpending {
  month: number;
  year: number;
  amount: number;
}

export interface CategorySpending {
  categoryId: string;
  categoryName: string;
  isProtected: boolean;
  monthlyAverage: number;
  trend: number;
  lastMonthAmount: number;
}

export async function getMonthlySpendingHistory(userId: string, months: number = 6) {
  const now = new Date();
  const results: MonthlySpending[] = [];

  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
    const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);

    const expenses = await prisma.transaction.aggregate({
      where: { userId, type: "expense", date: { gte: startDate, lte: endDate } },
      _sum: { amount: true },
    });

    results.push({
      month: date.getMonth() + 1,
      year: date.getFullYear(),
      amount: expenses._sum.amount?.toNumber() || 0,
    });
  }

  return results;
}

export function predictNextMonth(history: MonthlySpending[]): number {
  if (history.length < 2) return history[0]?.amount || 0;

  const dataPoints: [number, number][] = history.map((h, i) => [i, h.amount]);
  const regression = linearRegression(dataPoints);
  const predict = linearRegressionLine(regression);

  return Math.max(0, Math.round(predict(history.length) * 100) / 100);
}

export async function getSpendingByCategories(userId: string, months: number = 3): Promise<CategorySpending[]> {
  const now = new Date();
  const categories = await Category.find({ userId });
  const results: CategorySpending[] = [];

  for (const category of categories) {
    if (category.type !== "expense") continue;

    const monthlyAmounts: number[] = [];

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
      const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);

      const expenses = await prisma.transaction.aggregate({
        where: {
          userId,
          type: "expense",
          categoryId: category._id.toString(),
          date: { gte: startDate, lte: endDate },
        },
        _sum: { amount: true },
      });

      monthlyAmounts.push(expenses._sum.amount?.toNumber() || 0);
    }

    const monthlyAverage = monthlyAmounts.reduce((a, b) => a + b, 0) / monthlyAmounts.length;
    const lastMonthAmount = monthlyAmounts[monthlyAmounts.length - 1] || 0;

    let trend = 0;
    if (monthlyAmounts.length >= 2) {
      const dataPoints: [number, number][] = monthlyAmounts.map((a, i) => [i, a]);
      const regression = linearRegression(dataPoints);
      trend = regression.m;
    }

    results.push({
      categoryId: category._id.toString(),
      categoryName: category.name,
      isProtected: category.isProtected,
      monthlyAverage: Math.round(monthlyAverage * 100) / 100,
      trend: Math.round(trend * 100) / 100,
      lastMonthAmount,
    });
  }

  return results.sort((a, b) => b.monthlyAverage - a.monthlyAverage);
}

export function calculateSavingsPlan(
  categories: CategorySpending[],
  targetSaving: number
) {
  const cuttable = categories.filter((c) => !c.isProtected && c.monthlyAverage > 0);
  const recommendations: { categoryName: string; currentAmount: number; suggestedCut: number; newAmount: number }[] = [];

  let remaining = targetSaving;

  for (const cat of cuttable) {
    if (remaining <= 0) break;

    const maxCut = cat.monthlyAverage * 0.3;
    const cut = Math.min(maxCut, remaining);

    recommendations.push({
      categoryName: cat.categoryName,
      currentAmount: cat.monthlyAverage,
      suggestedCut: Math.round(cut * 100) / 100,
      newAmount: Math.round((cat.monthlyAverage - cut) * 100) / 100,
    });

    remaining -= cut;
  }

  return {
    recommendations,
    totalSaved: Math.round((targetSaving - remaining) * 100) / 100,
    targetReached: remaining <= 0,
    shortfall: remaining > 0 ? Math.round(remaining * 100) / 100 : 0,
  };
}