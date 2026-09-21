import { Router } from "express";
import {
  getMailchimpNewsletter,
  listMailchimpNewsletters,
  subscribeToNewsLetter,
} from "../controllers/mailchimp.controller";

const router = Router();

router.get("/newsletters/:id", getMailchimpNewsletter);
router.get("/newsletters", listMailchimpNewsletters);
router.post("/newsletters/subscribe", subscribeToNewsLetter);

export default router;
