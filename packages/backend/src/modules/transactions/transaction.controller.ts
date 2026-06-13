import type { Response } from "express";
import type { AuthRequest } from "../../middleware/auth";
import { createTransaction, deleteTransaction, listTransactions, updateTransaction } from "./transaction.service";
import { transactionsCreated } from "../../lib/metrics";

export async function list(req: AuthRequest, res: Response): Promise<void> {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const type = req.query.type as string | undefined;
    const categoryId = req.query.categoryId as string | undefined;
    const sort = req.query.sort as string | undefined;

    const result = await listTransactions(req.userId!, { page, limit, type, categoryId, sort });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
}

export async function create(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { amount, type, description, date, categoryId } = req.body;
    if (!amount || !type || !description || !date || !categoryId) {
      res.status(400).json({ error: "All fields are required" });
      return;
    }
    const transaction = await createTransaction(req.userId!, { amount, type, description, date, categoryId });
    transactionsCreated.inc({ type });
    res.status(201).json({ transaction });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create transaction";
    res.status(400).json({ error: message });
  }
}

export async function update(req: AuthRequest, res: Response): Promise<void> {
  try {
    const transaction = await updateTransaction(req.userId!, req.params.id as string, req.body);
    res.json({ transaction });
  } catch (error) {
    res.status(404).json({ error: "Transaction not found" });
  }
}

export async function remove(req: AuthRequest, res: Response): Promise<void> {
  try {
    await deleteTransaction(req.userId!, req.params.id as string);
    res.json({ message: "Transaction deleted" });
  } catch (error) {
    res.status(404).json({ error: "Transaction not found" });
  }
}