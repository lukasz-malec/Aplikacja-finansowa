import { Router } from "express";
import { authMiddleware } from "../../middleware/auth";
import { compare, monthlySummary, monthlyTrend, spendingByCategory, topExpenses } from "./analytics.controller";

const router: Router = Router();

router.use(authMiddleware);

/**
 * @openapi
 * /analytics/summary:
 *   get:
 *     tags: [Analytics]
 *     summary: Podsumowanie miesięczne (przychody, wydatki, bilans)
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: month
 *         schema: { type: integer }
 *       - in: query
 *         name: year
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Podsumowanie finansowe
 */
router.get("/summary", monthlySummary);

/**
 * @openapi
 * /analytics/spending-by-category:
 *   get:
 *     tags: [Analytics]
 *     summary: Wydatki wg kategorii
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: month
 *         schema: { type: integer }
 *       - in: query
 *         name: year
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Lista kategorii z kwotami
 */
router.get("/spending-by-category", spendingByCategory);

/**
 * @openapi
 * /analytics/trend:
 *   get:
 *     tags: [Analytics]
 *     summary: Trend wydatków z ostatnich N miesięcy
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: months
 *         schema: { type: integer, default: 6 }
 *     responses:
 *       200:
 *         description: Tablica z podsumowaniem per miesiąc
 */
router.get("/trend", monthlyTrend);

/**
 * @openapi
 * /analytics/compare:
 *   get:
 *     tags: [Analytics]
 *     summary: Porównanie dwóch miesięcy
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: month1
 *         required: true
 *         schema: { type: integer }
 *       - in: query
 *         name: year1
 *         required: true
 *         schema: { type: integer }
 *       - in: query
 *         name: month2
 *         required: true
 *         schema: { type: integer }
 *       - in: query
 *         name: year2
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Porównanie z różnicami procentowymi
 */
router.get("/compare", compare);

/**
 * @openapi
 * /analytics/top-expenses:
 *   get:
 *     tags: [Analytics]
 *     summary: Największe wydatki w miesiącu
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: month
 *         schema: { type: integer }
 *       - in: query
 *         name: year
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 5 }
 *     responses:
 *       200:
 *         description: Lista największych transakcji
 */
router.get("/top-expenses", topExpenses);

export default router;