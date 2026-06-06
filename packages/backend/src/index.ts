import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { connectMongo } from "./lib/mongo";
import authRouter from "./modules/auth/auth.router";
import categoryRouter from "./modules/categories/category.router";
import transactionRouter from "./modules/transactions/transaction.router";
import budgetRouter from "./modules/budgets/budget.router";
import goalRouter from "./modules/goals/goal.router";
import analyticsRouter from "./modules/analytics/analytics.router";
import advisorRouter from "./modules/advisor/advisor.router";

dotenv.config({ path: "../../.env" });

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get("/api/v1/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/categories", categoryRouter);
app.use("/api/v1/transactions", transactionRouter);
app.use("/api/v1/budgets", budgetRouter);
app.use("/api/v1/goals", goalRouter);
app.use("/api/v1/analytics", analyticsRouter);
app.use("/api/v1/advisor", advisorRouter);

async function start() {
  await connectMongo();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

start();