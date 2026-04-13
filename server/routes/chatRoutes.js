import express from "express";
import { askHelpAssistant } from "../controllers/chatController.js";
import { protect } from "../middleware/auth.js";

const chatRouter = express.Router();

chatRouter.post("/help", protect, askHelpAssistant);

export default chatRouter;
