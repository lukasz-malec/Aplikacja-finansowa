import type { Response } from "express";
import type { AuthRequest } from "../../middleware/auth";
import { compareMonths, getMonthlySummary, getMonthlyTrend, getSpendingByCategory, getTopExpenses } from "./analytics.service";

export async function monthlySummary(req: AuthRequest, res: Response): Promise<void> {
  try {
    const month = parseInt(req.query.month as string) || new Date().getMonth() + 1;
    const year = parseInt(req.query.year as string) || new Date().getFullYear();
    const summary = await getMonthlySummary(req.userId!, month, year);
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch summary" });
  }
}

export async function spendingByCategory(req: AuthRequest, res: Response): Promise<void> {
  try {
    const month = parseInt(req.query.month as string) || new Date().getMonth() + 1;
    const year = parseInt(req.query.year as string) || new Date().getFullYear();
    const data = await getSpendingByCategory(req.userId!, month, year);
    res.json({ spending: data });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch spending by category" });
  }
}

export async function monthlyTrend(req: AuthRequest, res: Response): Promise<void> {
  try {
    const months = parseInt(req.query.months as string) || 6;
    const data = await getMonthlyTrend(req.userId!, months);
    res.json({ trend: data });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch monthly trend" });
  }
}

export async function compare(req: AuthRequest, res: Response): Promise<void> {
  try {
    const month1 = parseInt(req.query.month1 as string);
    const year1 = parseInt(req.query.year1 as string);
    const month2 = parseInt(req.query.month2 as string);
    const year2 = parseInt(req.query.year2 as string);

    if (!month1 || !year1 || !month2 || !year2) {
      res.status(400).json({ error: "month1, year1, month2, year2 are required" });
      return;
    }

    const data = await compareMonths(req.userId!, month1, year1, month2, year2);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to compare months" });
  }
}

export async function topExpenses(req: AuthRequest, res: Response): Promise<void> {
  try {
    const month = parseInt(req.query.month as string) || new Date().getMonth() + 1;
    const year = parseInt(req.query.year as string) || new Date().getFullYear();
    const limit = parseInt(req.query.limit as string) || 5;
    const data = await getTopExpenses(req.userId!, month, year, limit);
    res.json({ expenses: data });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch top expenses" });
  }
}