import { Router } from "express";
import { authenticateToken } from "../middlewares/tokenValidation";
import { getInterviewBuddyChat, saveInterviewBuddyChat } from "../controller/interviewBuddy.controller";

const router = Router();

router.use(authenticateToken(["student"]));

router.get("/", getInterviewBuddyChat);
router.put("/", saveInterviewBuddyChat);

export default router;
