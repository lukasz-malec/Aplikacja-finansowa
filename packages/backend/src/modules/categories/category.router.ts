import { Router } from "express";
import { authMiddleware } from "../../middleware/auth";
import { create, list, remove, update } from "./category.controller";

const router: Router = Router();

router.use(authMiddleware);

/**
 * @openapi
 * /categories:
 *   get:
 *     tags: [Categories]
 *     summary: Lista kategorii użytkownika
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Lista kategorii
 *   post:
 *     tags: [Categories]
 *     summary: Stwórz kategorię
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, type]
 *             properties:
 *               name: { type: string }
 *               type: { type: string, enum: [income, expense] }
 *               icon: { type: string }
 *               color: { type: string }
 *     responses:
 *       201:
 *         description: Kategoria utworzona
 */
router.get("/", list);
router.post("/", create);

/**
 * @openapi
 * /categories/{id}:
 *   put:
 *     tags: [Categories]
 *     summary: Edytuj kategorię
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Kategoria zaktualizowana
 *   delete:
 *     tags: [Categories]
 *     summary: Usuń kategorię
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Kategoria usunięta
 */
router.put("/:id", update);
router.delete("/:id", remove);

export default router;