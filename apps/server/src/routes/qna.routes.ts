import { Router } from "express";
import {
  createQnaQuestion,
  listQnaQuestions,
} from "../controllers/qna.controller";
import { protect } from "../middleware/auth.middleware";

const router = Router();

router.get("/qna", listQnaQuestions);
router.post("/qna", protect, createQnaQuestion);

export default router;
