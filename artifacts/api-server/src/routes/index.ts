import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import contactRouter from "./contact";
import technologiesRouter from "./technologies";
import quotesRouter from "./quotes";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/contact", contactRouter);
router.use("/technologies", technologiesRouter);
router.use("/quotes", quotesRouter);
router.use("/admin", adminRouter);

export default router;
