import { Router } from 'express';
import multer from 'multer';
import {
  getApplications,
  createApplication,
  updateApplication,
  deleteApplication,
} from '../controllers/application.controller';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/applications', getApplications);
router.post('/applications', upload.single('resume'), createApplication);
router.put('/applications/:id', updateApplication);
router.delete('/applications/:id', deleteApplication);

export default router;
