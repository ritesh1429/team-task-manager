import express from 'express';
import { signup, login, getUsers } from '../controllers/authController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/users', protect, getUsers); // Both Admin and Member can view users to assign tasks

export default router;
