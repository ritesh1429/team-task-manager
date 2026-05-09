import Task from '../models/taskModel.js';
import Project from '../models/projectModel.js';

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Private
export const getTasks = async (req, res) => {
  try {
    let tasks;
    if (req.user.role === 'ADMIN') {
      tasks = await Task.find({})
        .populate('project', 'name')
        .populate('assignedTo', 'name email')
        .populate('createdBy', 'name email');
    } else {
      // Members see tasks in projects they are a part of
      const userProjects = await Project.find({ members: req.user._id }).select('_id');
      const projectIds = userProjects.map(p => p._id);
      
      tasks = await Task.find({ project: { $in: projectIds } })
        .populate('project', 'name')
        .populate('assignedTo', 'name email')
        .populate('createdBy', 'name email');
    }
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get tasks by project ID
// @route   GET /api/tasks/project/:projectId
// @access  Private
export const getTasksByProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    
    if (!project) {
        return res.status(404).json({ message: 'Project not found' });
    }

    if (req.user.role !== 'ADMIN' && !project.members.includes(req.user._id)) {
        return res.status(403).json({ message: 'Not authorized to view tasks for this project' });
    }

    const tasks = await Task.find({ project: req.params.projectId })
        .populate('assignedTo', 'name email')
        .populate('createdBy', 'name email');
    
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// @desc    Create a task
// @route   POST /api/tasks
// @access  Private/Admin
export const createTask = async (req, res) => {
  try {
    const { title, description, status, dueDate, project, assignedTo } = req.body;

    const task = new Task({
      title,
      description,
      status,
      dueDate,
      project,
      assignedTo,
      createdBy: req.user._id
    });

    const createdTask = await task.save();

    // Auto-add assignee to project members so they can see the project
    if (assignedTo) {
      await Project.findByIdAndUpdate(
        project,
        { $addToSet: { members: assignedTo } }
      );
    }
    
    // populate before returning
    const populatedTask = await Task.findById(createdTask._id)
        .populate('project', 'name')
        .populate('assignedTo', 'name email');

    res.status(201).json(populatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a task (Admin can update all, Member can update status if assigned)
// @route   PUT /api/tasks/:id
// @access  Private
export const updateTask = async (req, res) => {
  try {
    const { title, description, status, dueDate, assignedTo } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (req.user.role === 'ADMIN') {
        task.title = title || task.title;
        task.description = description || task.description;
        task.status = status || task.status;
        task.dueDate = dueDate || task.dueDate;
        if(assignedTo !== undefined) {
          task.assignedTo = assignedTo;
          // Auto-add new assignee to project members
          if (assignedTo) {
            await Project.findByIdAndUpdate(
              task.project,
              { $addToSet: { members: assignedTo } }
            );
          }
        }
    } else {
        // Member trying to update
        if (task.assignedTo && task.assignedTo.toString() === req.user._id.toString()) {
            // Only allow status update
            if (status) task.status = status;
        } else {
            return res.status(403).json({ message: 'Not authorized to update this task' });
        }
    }

    const updatedTask = await task.save();
    
    const populatedTask = await Task.findById(updatedTask._id)
        .populate('project', 'name')
        .populate('assignedTo', 'name email');
        
    res.json(populatedTask);
    
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private/Admin
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (task) {
      await task.deleteOne();
      res.json({ message: 'Task removed' });
    } else {
      res.status(404).json({ message: 'Task not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
