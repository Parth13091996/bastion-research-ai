import { Router } from "express";
import { subscribeToNewsLetter } from "../controllers/mailchimp.controller";

const router = Router();

router.post("/newsletters/subscribe", subscribeToNewsLetter);

export default router;
