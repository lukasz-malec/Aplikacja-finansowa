import type { Response } from "express";
import type { AuthRequest } from "../../middleware/auth";
import { addToGoal, createGoal, deleteGoal, listGoals, updateGoal } from "./goal.service";

export async function list(req: AuthRequest, res: Response): Promise<void> {
  try {
    const goals = await listGoals(req.userId!);
    const formatted = goals.map((g: typeof goals[number]) => ({
      ...g,
      targetAmount: g.targetAmount.toNumber(),
      currentAmount: g.currentAmount.toNumber(),
      progress: g.targetAmount.toNumber() > 0
        ? Math.round((g.currentAmount.toNumber() / g.targetAmount.toNumber()) * 100)
        : 0,
    }));
    res.json({ goals: formatted });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch goals" });
  }
}

export async function create(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { name, targetAmount, deadline } = req.body;
    if (!name || !targetAmount || !deadline) {
      res.status(400).json({ error: "name, targetAmount and deadline are required" });
      return;
    }
    const goal = await createGoal(req.userId!, { name, targetAmount, deadline });
    res.status(201).json({ goal });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create goal";
    res.status(400).json({ error: message });
  }
}

export async function update(req: AuthRequest, res: Response): Promise<void> {
  try {
    const goal = await updateGoal(req.userId!, req.params.id as string, req.body);
    res.json({ goal });
  } catch (error) {
    res.status(404).json({ error: "Goal not found" });
  }
}

export async function remove(req: AuthRequest, res: Response): Promise<void> {
  try {
    await deleteGoal(req.userId!, req.params.id as string);
    res.json({ message: "Goal deleted" });
  } catch (error) {
    res.status(404).json({ error: "Goal not found" });
  }
}

export async function contribute(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) {
      res.status(400).json({ error: "Positive amount is required" });
      return;
    }
    const goal = await addToGoal(req.userId!, req.params.id as string, amount);
    res.json({ goal });
  } catch (error) {
    res.status(404).json({ error: "Goal not found" });
  }
}