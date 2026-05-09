import Project from '../models/projectModel.js';

// @desc    Get all projects (User specific: admins see all, members see projects they are in)
// @route   GET /api/projects
// @access  Private
export const getProjects = async (req, res) => {
  try {
    let projects;
    if (req.user.role === 'ADMIN') {
      projects = await Project.find({}).populate('createdBy', 'name email').populate('members', 'name email');
    } else {
      projects = await Project.find({ members: req.user._id }).populate('createdBy', 'name email').populate('members', 'name email');
    }
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a project
// @route   POST /api/projects
// @access  Private/Admin
export const createProject = async (req, res) => {
  try {
    const { name, description, members } = req.body;
    
    // Always include creator as a member
    const projectMembers = members ? [...new Set([...members, req.user._id])] : [req.user._id];

    const project = new Project({
      name,
      description,
      createdBy: req.user._id,
      members: projectMembers
    });

    const createdProject = await project.save();
    res.status(201).json(createdProject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get project by ID
// @route   GET /api/projects/:id
// @access  Private
export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('members', 'name email');

    if (project) {
      // Check if user is admin or member of the project
      if (req.user.role === 'ADMIN' || project.members.some(member => member._id.toString() === req.user._id.toString())) {
         res.json(project);
      } else {
        res.status(403).json({ message: 'Not authorized to view this project' });
      }
    } else {
      res.status(404).json({ message: 'Project not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a project
// @route   PUT /api/projects/:id
// @access  Private/Admin
export const updateProject = async (req, res) => {
  try {
    const { name, description, members } = req.body;
    const project = await Project.findById(req.params.id);

    if (project) {
      project.name = name || project.name;
      project.description = description || project.description;
      if (members) {
         project.members = [...new Set([...members, project.createdBy])]; // Ensure creator remains
      }

      const updatedProject = await project.save();
      res.json(updatedProject);
    } else {
      res.status(404).json({ message: 'Project not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a project
// @route   DELETE /api/projects/:id
// @access  Private/Admin
export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (project) {
      await project.deleteOne();
      res.json({ message: 'Project removed' });
    } else {
      res.status(404).json({ message: 'Project not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
