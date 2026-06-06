import { Router } from "express";
import { authMiddleware } from "../../middleware/auth";
import { create, list, remove, summary, update } from "./budget.controller";

const router: Router = Router();

router.use(authMiddleware);

/**
 * @openapi
 * /budgets:
 *   get:
 *     tags: [Budgets]
 *     summary: Lista budżetów
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
 *         description: Lista budżetów
 *   post:
 *     tags: [Budgets]
 *     summary: Stwórz budżet
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [categoryId, amount, month, year]
 *             properties:
 *               categoryId: { type: string }
 *               amount: { type: number }
 *               month: { type: integer }
 *               year: { type: integer }
 *     responses:
 *       201:
 *         description: Budżet utworzony
 */
router.get("/", list);
router.post("/", create);

/**
 * @openapi
 * /budgets/summary:
 *   get:
 *     tags: [Budgets]
 *     summary: Podsumowanie budżetów z wydatkami
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
 *         description: Podsumowanie budżetów ze stanem realizacji
 */
router.get("/summary", summary);

/**
 * @openapi
 * /budgets/{id}:
 *   put:
 *     tags: [Budgets]
 *     summary: Edytuj budżet
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Budżet zaktualizowany
 *   delete:
 *     tags: [Budgets]
 *     summary: Usuń budżet
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Budżet usunięty
 */
router.put("/:id", update);
router.delete("/:id", remove);

export default router;