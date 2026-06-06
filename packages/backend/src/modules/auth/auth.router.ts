import { Router } from "express";
import { login, logout, me, register } from "./auth.controller";
import { authMiddleware } from "../../middleware/auth";

const router: Router = Router();

/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Rejestracja nowego użytkownika
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, name, password]
 *             properties:
 *               email: { type: string, format: email }
 *               name: { type: string }
 *               password: { type: string, minLength: 6 }
 *     responses:
 *       201:
 *         description: Użytkownik zarejestrowany
 *       400:
 *         description: Błąd walidacji lub email zajęty
 */
router.post("/register", register);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Logowanie użytkownika
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Zalogowano, token w cookie
 *       401:
 *         description: Nieprawidłowe dane logowania
 */
router.post("/login", login);

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Wylogowanie
 *     responses:
 *       200:
 *         description: Wylogowano
 */
router.post("/logout", logout);

/**
 * @openapi
 * /auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Dane zalogowanego użytkownika
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: ID użytkownika
 *       401:
 *         description: Brak autoryzacji
 */
router.get("/me", authMiddleware, me);

export default router;