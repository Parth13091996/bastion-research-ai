import { Router } from 'express';
import {
  listNewsletters,
  listPodcasts,
  listWebinars,
} from '../controllers/content.controller';

const router = Router();

router.get('/newsletters', listNewsletters);
router.get('/webinars', listWebinars);
router.get('/podcasts', listPodcasts);

export default router;

