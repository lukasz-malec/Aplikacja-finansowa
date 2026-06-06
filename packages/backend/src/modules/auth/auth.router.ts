import { Router } from "express";
import { login, logout, me, register } from "./auth.controller.js";
import { authMiddleware } from "../../middleware/auth.js";

const router: Router = Router();;

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", authMiddleware, me);

export default router;