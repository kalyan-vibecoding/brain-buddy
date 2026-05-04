import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import childrenRouter from "./children";
import completionsRouter from "./completions";
import badgesRouter from "./badges";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(childrenRouter);
router.use(completionsRouter);
router.use(badgesRouter);
router.use(dashboardRouter);

export default router;
