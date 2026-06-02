import { Router } from "express";
import messagesRouter from "./messages";
import technologiesRouter from "./technologies";
import smtpRouter from "./smtp";
import credentialsRouter from "./credentials";
import quotesRouter from "./quotes";

const router = Router();

router.use("/messages", messagesRouter);
router.use("/technologies", technologiesRouter);
router.use("/smtp", smtpRouter);
router.use("/credentials", credentialsRouter);
router.use("/quotes", quotesRouter);

export default router;
