import { Router } from 'express';
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from '../controllers/user.controller';
import { protect, requireSectionEdit, staff, type AuthRequest } from '../middleware/auth.middleware';

const router = Router();

const requireUserUpdatePermission = async (
  req: AuthRequest,
  res: any,
  next: any
) => {
  // Admin always allowed.
  if (req.user?.role === 'admin') return next();

  const targetUserId = String(req.params.id || '');
  const isSelf = req.user?.id && String(req.user.id) === targetUserId;

  if (isSelf) {
    return requireSectionEdit('ar_profile')(req, res, next);
  }

  return requireSectionEdit('ar_manage_members')(req, res, next);
};

router.get('/users', protect, staff, getUsers);
router.get('/users/:id', protect, staff, getUserById);
router.post('/users', protect, staff, requireSectionEdit('ar_manage_members'), createUser);
router.put('/users/:id', protect, updateUser);
router.delete('/users/:id', protect, staff, requireSectionEdit('ar_manage_members'), deleteUser);

export default router;
