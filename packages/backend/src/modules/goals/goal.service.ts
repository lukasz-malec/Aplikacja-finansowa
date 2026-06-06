import { prisma } from "../../lib/prisma";

interface CreateGoalData {
  name: string;
  targetAmount: number;
  deadline: string;
}

export async function listGoals(userId: string) {
  return prisma.goal.findMany({
    where: { userId },
    orderBy: { deadline: "asc" },
  });
}

export async function createGoal(userId: string, data: CreateGoalData) {
  return prisma.goal.create({
    data: {
      userId,
      name: data.name,
      targetAmount: data.targetAmount,
      deadline: new Date(data.deadline),
    },
  });
}

export async function updateGoal(userId: string, id: string, data: { name?: string; targetAmount?: number; currentAmount?: number; deadline?: string }) {
  const goal = await prisma.goal.findFirst({ where: { id, userId } });
  if (!goal) throw new Error("Goal not found");

  return prisma.goal.update({
    where: { id },
    data: {
      ...data,
      deadline: data.deadline ? new Date(data.deadline) : undefined,
    },
  });
}

export async function deleteGoal(userId: string, id: string) {
  const goal = await prisma.goal.findFirst({ where: { id, userId } });
  if (!goal) throw new Error("Goal not found");

  return prisma.goal.delete({ where: { id } });
}

export async function addToGoal(userId: string, id: string, amount: number) {
  const goal = await prisma.goal.findFirst({ where: { id, userId } });
  if (!goal) throw new Error("Goal not found");

  const newAmount = goal.currentAmount.toNumber() + amount;

  return prisma.goal.update({
    where: { id },
    data: { currentAmount: newAmount },
  });
}