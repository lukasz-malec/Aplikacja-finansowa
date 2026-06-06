import { Router } from "express";
import { authMiddleware } from "../../middleware/auth";
import { contribute, create, list, remove, update } from "./goal.controller";

const router: Router = Router();

router.use(authMiddleware);

/**
 * @openapi
 * /goals:
 *   get:
 *     tags: [Goals]
 *     summary: Lista celów finansowych
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Lista celów z postępem
 *   post:
 *     tags: [Goals]
 *     summary: Stwórz cel finansowy
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, targetAmount, deadline]
 *             properties:
 *               name: { type: string }
 *               targetAmount: { type: number }
 *               deadline: { type: string, format: date }
 *     responses:
 *       201:
 *         description: Cel utworzony
 */
router.get("/", list);
router.post("/", create);

/**
 * @openapi
 * /goals/{id}:
 *   put:
 *     tags: [Goals]
 *     summary: Edytuj cel
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Cel zaktualizowany
 *   delete:
 *     tags: [Goals]
 *     summary: Usuń cel
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Cel usunięty
 */
router.put("/:id", update);
router.delete("/:id", remove);

/**
 * @openapi
 * /goals/{id}/contribute:
 *   post:
 *     tags: [Goals]
 *     summary: Wpłać na cel
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount]
 *             properties:
 *               amount: { type: number }
 *     responses:
 *       200:
 *         description: Wpłata dodana
 */
router.post("/:id/contribute", contribute);

export default router;