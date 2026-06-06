import type { Response } from "express";
import type { AuthRequest } from "../../middleware/auth";
import { createCategory, deleteCategory, getCategories, updateCategory } from "./category.service";

export async function list(req: AuthRequest, res: Response): Promise<void> {
  try {
    const categories = await getCategories(req.userId!);
    res.json({ categories });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch categories" });
  }
}

export async function create(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { name, icon, color, type } = req.body;
    if (!name || !type) {
      res.status(400).json({ error: "Name and type are required" });
      return;
    }
    const category = await createCategory(req.userId!, { name, icon, color, type });
    res.status(201).json({ category });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create category";
    res.status(400).json({ error: message });
  }
}

export async function update(req: AuthRequest, res: Response): Promise<void> {
  try {
    const category = await updateCategory(req.userId!, req.params.id as string, req.body);
    res.json({ category });
  } catch (error) {
    res.status(404).json({ error: "Category not found" });
  }
}

export async function remove(req: AuthRequest, res: Response): Promise<void> {
  try {
    await deleteCategory(req.userId!, req.params.id as string);
    res.json({ message: "Category deleted" });
  } catch (error) {
    res.status(404).json({ error: "Category not found" });
  }
}