import { Router } from "express";
import { authMiddleware } from "../../middleware/auth";
import { create, list, remove, summary, update } from "./budget.controller";

const router: Router = Router();

router.use(authMiddleware);
router.get("/", list);
router.get("/summary", summary);
router.post("/", create);
router.put("/:id", update);
router.delete("/:id", remove);

export default router;