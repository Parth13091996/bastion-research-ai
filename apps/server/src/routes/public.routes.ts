import { Router } from "express";
import { getPublicMembers } from "../controllers/public-members.controller";
import { requirePublicApiKey } from "../middleware/publicApi.middleware";

const router = Router();

router.use(requirePublicApiKey);
router.get("/members", getPublicMembers);
router.all("/members", (_req, res) => {
  return res
    .status(405)
    .set("Allow", "GET")
    .json({ error: "Method not allowed" });
});

export default router;
