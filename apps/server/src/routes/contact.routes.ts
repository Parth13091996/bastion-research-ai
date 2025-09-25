import { Router } from 'express';
import { submitContact } from '../controllers/contact.controller';

const router = Router();

router.post('/contact', submitContact);

export default router;

