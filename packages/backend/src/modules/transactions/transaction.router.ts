import { Router } from "express";
import { authMiddleware } from "../../middleware/auth";
import { create, list, remove, update } from "./transaction.controller";

const router: Router = Router();

router.use(authMiddleware);

/**
 * @openapi
 * /transactions:
 *   get:
 *     tags: [Transactions]
 *     summary: Lista transakcji z paginacją i filtrowaniem
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: type
 *         schema: { type: string, enum: [income, expense] }
 *       - in: query
 *         name: categoryId
 *         schema: { type: string }
 *       - in: query
 *         name: sort
 *         schema: { type: string }
 *         description: "Pole sortowania, prefix - = desc (np. -date)"
 *     responses:
 *       200:
 *         description: Lista transakcji
 *   post:
 *     tags: [Transactions]
 *     summary: Dodaj transakcję
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount, type, description, date, categoryId]
 *             properties:
 *               amount: { type: number }
 *               type: { type: string, enum: [income, expense] }
 *               description: { type: string }
 *               date: { type: string, format: date }
 *               categoryId: { type: string }
 *     responses:
 *       201:
 *         description: Transakcja utworzona
 */
router.get("/", list);
router.post("/", create);

/**
 * @openapi
 * /transactions/{id}:
 *   put:
 *     tags: [Transactions]
 *     summary: Edytuj transakcję
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Transakcja zaktualizowana
 *   delete:
 *     tags: [Transactions]
 *     summary: Usuń transakcję
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Transakcja usunięta
 */
router.put("/:id", update);
router.delete("/:id", remove);

export default router;