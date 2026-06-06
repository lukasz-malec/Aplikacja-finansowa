import mongoose, { Schema, type Document } from "mongoose";

export interface ICategory extends Document {
  userId: string;
  name: string;
  color: string;
  type: "income" | "expense";
  isProtected: boolean;
}

const categorySchema = new Schema<ICategory>(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    color: { type: String, default: "#6B7280" },
    type: { type: String, enum: ["income", "expense"], required: true },
    isProtected: { type: Boolean, default: false },
  },
  { timestamps: true }
);

categorySchema.index({ userId: 1, name: 1 }, { unique: true });

export const Category = mongoose.model<ICategory>("Category", categorySchema);