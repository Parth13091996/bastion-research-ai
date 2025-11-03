import { Router } from 'express';
import multer from 'multer';
import {
  getApplications,
  createApplication,
  updateApplication,
  deleteApplication,
} from '../controllers/application.controller';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: Number(process.env.MAX_UPLOAD_FILE_SIZE || 25 * 1024 * 1024),
    files: 1,
  },
});

router.get('/applications', getApplications);
router.post('/applications', upload.single('resume'), createApplication);
router.put('/applications/:id', updateApplication);
router.delete('/applications/:id', deleteApplication);

export default router;
