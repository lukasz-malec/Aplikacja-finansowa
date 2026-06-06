import { Router } from "express";
import { authMiddleware } from "../../middleware/auth";
import { advise, quickAnalysis } from "./advisor.controller";

const router: Router = Router();

router.use(authMiddleware);
router.get("/advise", advise);
router.get("/quick", quickAnalysis);

export default router;