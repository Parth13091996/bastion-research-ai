import { Router } from 'express';
import {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
} from '../controllers/job.controller';

const router = Router();

router.get('/jobs', getJobs);
router.get('/jobs/:id', getJobById);
router.post('/jobs', createJob);
router.put('/jobs/:id', updateJob);
router.delete('/jobs/:id', deleteJob);

export default router;
