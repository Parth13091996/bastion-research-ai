import { Router } from 'express';
import {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
} from '../controllers/job.controller';
import { protect, requireSectionEdit, staff } from '../middleware/auth.middleware';

const router = Router();

router.get('/jobs', getJobs);
router.get('/jobs/:id', getJobById);
router.post('/jobs', protect, staff, requireSectionEdit('jobs_add_new_job'), createJob);
router.put('/jobs/:id', protect, staff, requireSectionEdit('jobs_job_openings'), updateJob);
router.delete('/jobs/:id', protect, staff, requireSectionEdit('jobs_job_openings'), deleteJob);

export default router;
