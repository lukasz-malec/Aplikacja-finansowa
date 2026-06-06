import { Router } from "express";
import { authMiddleware } from "../../middleware/auth";
import { compare, monthlySummary, monthlyTrend, spendingByCategory, topExpenses } from "./analytics.controller";

const router: Router = Router();

router.use(authMiddleware);
router.get("/summary", monthlySummary);
router.get("/spending-by-category", spendingByCategory);
router.get("/trend", monthlyTrend);
router.get("/compare", compare);
router.get("/top-expenses", topExpenses);

export default router;