import express from 'express';
import { getTasks, createTask, updateTask, deleteTask, getTasksByProject } from '../controllers/taskController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getTasks)
  .post(protect, admin, createTask);

router.route('/:id')
  .put(protect, updateTask) // Members can update status, Admin can update all
  .delete(protect, admin, deleteTask);

router.route('/project/:projectId')
    .get(protect, getTasksByProject);

export default router;
