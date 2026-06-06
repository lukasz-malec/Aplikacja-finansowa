import mongoose from "mongoose";

export async function connectMongo() {
  const url = process.env.MONGO_URL || "mongodb://budget_user:budget_pass@localhost:27017/budget_db?authSource=admin";
  await mongoose.connect(url);
  console.log("MongoDB connected");
}