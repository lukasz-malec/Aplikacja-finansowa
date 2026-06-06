import { Category } from "./category.model";

export async function getCategories(userId: string) {
  return Category.find({ userId }).sort({ name: 1 });
}

export async function createCategory(userId: string, data: { name: string; icon?: string; color?: string; type: "income" | "expense" }) {
  return Category.create({ userId, ...data });
}

export async function updateCategory(userId: string, categoryId: string, data: { name?: string; icon?: string; color?: string; isProtected?: boolean }) {
  const category = await Category.findOneAndUpdate(
    { _id: categoryId, userId },
    { $set: data },
    { new: true }
  );
  if (!category) throw new Error("Category not found");
  return category;
}

export async function deleteCategory(userId: string, categoryId: string) {
  const category = await Category.findOneAndDelete({ _id: categoryId, userId });
  if (!category) throw new Error("Category not found");
  return category;
}