import { prisma } from "../../lib/prisma";

interface CreateTransactionData {
  amount: number;
  type: "income" | "expense";
  description: string;
  date: string;
  categoryId: string;
}

interface ListParams {
  page: number;
  limit: number;
  type?: string;
  categoryId?: string;
  sort?: string;
}

export async function listTransactions(userId: string, params: ListParams) {
  const { page, limit, type, categoryId, sort } = params;
  const skip = (page - 1) * limit;

  const where: any = { userId };
  if (type) where.type = type;
  if (categoryId) where.categoryId = categoryId;

  const orderBy: any = {};
  if (sort) {
    const desc = sort.startsWith("-");
    const field = desc ? sort.slice(1) : sort;
    orderBy[field] = desc ? "desc" : "asc";
  } else {
    orderBy.date = "desc";
  }

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({ where, orderBy, skip, take: limit }),
    prisma.transaction.count({ where }),
  ]);

  return { transactions, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function createTransaction(userId: string, data: CreateTransactionData) {
  return prisma.transaction.create({
    data: {
      userId,
      amount: data.amount,
      type: data.type,
      description: data.description,
      date: new Date(data.date),
      categoryId: data.categoryId,
    },
  });
}

export async function updateTransaction(userId: string, id: string, data: Partial<CreateTransactionData>) {
  const transaction = await prisma.transaction.findFirst({ where: { id, userId } });
  if (!transaction) throw new Error("Transaction not found");

  return prisma.transaction.update({
    where: { id },
    data: {
      ...data,
      date: data.date ? new Date(data.date) : undefined,
    },
  });
}

export async function deleteTransaction(userId: string, id: string) {
  const transaction = await prisma.transaction.findFirst({ where: { id, userId } });
  if (!transaction) throw new Error("Transaction not found");

  return prisma.transaction.delete({ where: { id } });
}