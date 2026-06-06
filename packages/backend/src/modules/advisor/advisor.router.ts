import { Router } from "express";
import { authMiddleware } from "../../middleware/auth";
import { advise, quickAnalysis } from "./advisor.controller";

const router: Router = Router();

router.use(authMiddleware);

/**
 * @openapi
 * /advisor/quick:
 *   get:
 *     tags: [Advisor]
 *     summary: Szybka analiza - predykcje i wydatki per kategoria
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Predykcja wydatków i analiza kategorii
 */
router.get("/quick", quickAnalysis);

/**
 * @openapi
 * /advisor/advise:
 *   get:
 *     tags: [Advisor]
 *     summary: Doradztwo finansowe (SSE stream z LLM)
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: targetSaving
 *         schema: { type: number }
 *         description: Kwota którą chcesz zaoszczędzić
 *     responses:
 *       200:
 *         description: Stream SSE z rekomendacjami
 *         content:
 *           text/event-stream:
 *             schema:
 *               type: string
 */
router.get("/advise", advise);

export default router;