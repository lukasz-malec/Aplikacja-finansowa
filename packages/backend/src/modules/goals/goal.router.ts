import { Router } from "express";
import { authMiddleware } from "../../middleware/auth";
import { contribute, create, list, remove, update } from "./goal.controller";

const router: Router = Router();

router.use(authMiddleware);
router.get("/", list);
router.post("/", create);
router.put("/:id", update);
router.delete("/:id", remove);
router.post("/:id/contribute", contribute);

export default router;