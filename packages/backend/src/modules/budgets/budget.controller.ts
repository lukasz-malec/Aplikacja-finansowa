import type { Response } from "express";
import type { AuthRequest } from "../../middleware/auth";
import { createBudget, deleteBudget, getBudgetSummary, listBudgets, updateBudget } from "./budget.service";

export async function list(req: AuthRequest, res: Response): Promise<void> {
  try {
    const month = req.query.month ? parseInt(req.query.month as string) : undefined;
    const year = req.query.year ? parseInt(req.query.year as string) : undefined;
    const budgets = await listBudgets(req.userId!, month, year);
    res.json({ budgets });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch budgets" });
  }
}

export async function create(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { categoryId, amount, month, year } = req.body;
    if (!categoryId || !amount || !month || !year) {
      res.status(400).json({ error: "categoryId, amount, month and year are required" });
      return;
    }
    const budget = await createBudget(req.userId!, { categoryId, amount, month, year });
    res.status(201).json({ budget });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create budget";
    res.status(400).json({ error: message });
  }
}

export async function update(req: AuthRequest, res: Response): Promise<void> {
  try {
    const budget = await updateBudget(req.userId!, req.params.id as string, req.body);
    res.json({ budget });
  } catch (error) {
    res.status(404).json({ error: "Budget not found" });
  }
}

export async function remove(req: AuthRequest, res: Response): Promise<void> {
  try {
    await deleteBudget(req.userId!, req.params.id as string);
    res.json({ message: "Budget deleted" });
  } catch (error) {
    res.status(404).json({ error: "Budget not found" });
  }
}

export async function summary(req: AuthRequest, res: Response): Promise<void> {
  try {
    const month = parseInt(req.query.month as string) || new Date().getMonth() + 1;
    const year = parseInt(req.query.year as string) || new Date().getFullYear();
    const data = await getBudgetSummary(req.userId!, month, year);
    res.json({ summary: data });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch budget summary" });
  }
}