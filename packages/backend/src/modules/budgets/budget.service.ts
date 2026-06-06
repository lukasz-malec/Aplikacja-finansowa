import { prisma } from "../../lib/prisma";

interface CreateBudgetData {
  categoryId: string;
  amount: number;
  month: number;
  year: number;
}

export async function listBudgets(userId: string, month?: number, year?: number) {
  const where: any = { userId };
  if (month) where.month = month;
  if (year) where.year = year;

  return prisma.budget.findMany({ where, orderBy: { createdAt: "desc" } });
}

export async function createBudget(userId: string, data: CreateBudgetData) {
  return prisma.budget.create({
    data: { userId, ...data },
  });
}

export async function updateBudget(userId: string, id: string, data: Partial<CreateBudgetData>) {
  const budget = await prisma.budget.findFirst({ where: { id, userId } });
  if (!budget) throw new Error("Budget not found");

  return prisma.budget.update({ where: { id }, data });
}

export async function deleteBudget(userId: string, id: string) {
  const budget = await prisma.budget.findFirst({ where: { id, userId } });
  if (!budget) throw new Error("Budget not found");

  return prisma.budget.delete({ where: { id } });
}

export async function getBudgetSummary(userId: string, month: number, year: number) {
  const budgets = await prisma.budget.findMany({
    where: { userId, month, year },
  });

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  const spent = await prisma.transaction.groupBy({
    by: ["categoryId"],
    where: {
      userId,
      type: "expense",
      date: { gte: startDate, lte: endDate },
    },
    _sum: { amount: true },
  });

  return budgets.map((budget: typeof budgets[number]) => {
    const categorySpent = spent.find((s: typeof spent[number]) => s.categoryId === budget.categoryId);
    const spentAmount = categorySpent?._sum.amount?.toNumber() || 0;
    const budgetAmount = budget.amount.toNumber();

    return {
      ...budget,
      amount: budgetAmount,
      spent: spentAmount,
      remaining: budgetAmount - spentAmount,
      percentUsed: budgetAmount > 0 ? Math.round((spentAmount / budgetAmount) * 100) : 0,
    };
  });
}