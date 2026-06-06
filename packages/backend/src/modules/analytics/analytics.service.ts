import { prisma } from "../../lib/prisma";
import { Category } from "../categories/category.model";

interface DateRange {
  startDate: Date;
  endDate: Date;
}

function getMonthRange(month: number, year: number): DateRange {
  return {
    startDate: new Date(year, month - 1, 1),
    endDate: new Date(year, month, 0, 23, 59, 59),
  };
}

export async function getMonthlySummary(userId: string, month: number, year: number) {
  const { startDate, endDate } = getMonthRange(month, year);

  const [income, expenses] = await Promise.all([
    prisma.transaction.aggregate({
      where: { userId, type: "income", date: { gte: startDate, lte: endDate } },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { userId, type: "expense", date: { gte: startDate, lte: endDate } },
      _sum: { amount: true },
    }),
  ]);

  const totalIncome = income._sum.amount?.toNumber() || 0;
  const totalExpenses = expenses._sum.amount?.toNumber() || 0;

  return {
    month,
    year,
    totalIncome,
    totalExpenses,
    balance: totalIncome - totalExpenses,
  };
}

export async function getSpendingByCategory(userId: string, month: number, year: number) {
  const { startDate, endDate } = getMonthRange(month, year);

  const spending = await prisma.transaction.groupBy({
    by: ["categoryId"],
    where: { userId, type: "expense", date: { gte: startDate, lte: endDate } },
    _sum: { amount: true },
    orderBy: { _sum: { amount: "desc" } },
  });

  const categories = await Category.find({ userId });
  const categoryMap = new Map(categories.map((c) => [c._id.toString(), c]));

  return spending.map((s: typeof spending[number]) => ({
    categoryId: s.categoryId,
    categoryName: categoryMap.get(s.categoryId)?.name || "Nieznana",
    categoryColor: categoryMap.get(s.categoryId)?.color || "#6B7280",
    amount: s._sum.amount?.toNumber() || 0,
  }));
}

export async function getMonthlyTrend(userId: string, months: number = 6) {
  const now = new Date();
  const results = [];

  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const summary = await getMonthlySummary(userId, month, year);
    results.push(summary);
  }

  return results;
}

export async function compareMonths(userId: string, month1: number, year1: number, month2: number, year2: number) {
  const [current, previous] = await Promise.all([
    getMonthlySummary(userId, month1, year1),
    getMonthlySummary(userId, month2, year2),
  ]);

  const incomeDiff = current.totalIncome - previous.totalIncome;
  const expensesDiff = current.totalExpenses - previous.totalExpenses;

  return {
    current,
    previous,
    difference: {
      income: incomeDiff,
      incomePercent: previous.totalIncome > 0 ? Math.round((incomeDiff / previous.totalIncome) * 100) : 0,
      expenses: expensesDiff,
      expensesPercent: previous.totalExpenses > 0 ? Math.round((expensesDiff / previous.totalExpenses) * 100) : 0,
    },
  };
}

export async function getTopExpenses(userId: string, month: number, year: number, limit: number = 5) {
  const { startDate, endDate } = getMonthRange(month, year);

  return prisma.transaction.findMany({
    where: { userId, type: "expense", date: { gte: startDate, lte: endDate } },
    orderBy: { amount: "desc" },
    take: limit,
  });
}