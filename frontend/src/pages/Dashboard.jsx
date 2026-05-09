import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProjectModal from '../components/ProjectModal';
import TaskModal from '../components/TaskModal';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  
  const [selectedProject, setSelectedProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await axios.get('/api/projects', {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setProjects(res.data);
      } catch (error) {
        console.error('Error fetching projects', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (user?.token) {
        fetchProjects();
    }
  }, [user]);

  const fetchTasks = async (projectId) => {
      setTasksLoading(true);
      try {
          const res = await axios.get(`/api/tasks/project/${projectId}`, {
              headers: { Authorization: `Bearer ${user.token}` }
          });
          setTasks(res.data);
      } catch (error) {
          console.error('Error fetching tasks', error);
      } finally {
          setTasksLoading(false);
      }
  };

  const handleSelectProject = (project) => {
      setSelectedProject(project);
      fetchTasks(project._id);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleProjectCreated = (newProject) => {
    setProjects([...projects, newProject]);
  };

  const handleTaskCreated = (newTask) => {
      setTasks([...tasks, newTask]);
  };

  const handleStatusChange = async (taskId, newStatus) => {
      try {
          const res = await axios.put(`/api/tasks/${taskId}`, 
              { status: newStatus },
              { headers: { Authorization: `Bearer ${user.token}` } }
          );
          setTasks(tasks.map(t => t._id === taskId ? res.data : t));
      } catch (error) {
          console.error('Failed to update task status', error);
          alert('Failed to update status. Are you authorized?');
      }
  };

  return (
    <div className="main-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <h1 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
            Team Task Manager
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Welcome back, {user?.name} ({user?.role})</p>
        </div>
        <button onClick={handleLogout} className="btn btn-secondary">
          Logout
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
             <h2 style={{ fontSize: '1.25rem' }}>Your Projects</h2>
             {user?.role === 'ADMIN' && (
                <button className="btn btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }} onClick={() => setIsProjectModalOpen(true)}>+ New</button>
             )}
          </div>
          
          {loading ? (
            <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>
          ) : projects.length > 0 ? (
            <ul style={{ listStyle: 'none' }}>
              {projects.map(p => (
                <li 
                    key={p._id} 
                    onClick={() => handleSelectProject(p)}
                    style={{ 
                        padding: '1rem', 
                        borderBottom: '1px solid var(--border-color)', 
                        cursor: 'pointer', 
                        transition: 'all 0.2s',
                        backgroundColor: selectedProject?._id === p._id ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                        borderLeft: selectedProject?._id === p._id ? '3px solid var(--accent-primary)' : '3px solid transparent'
                    }} 
                >
                  <strong style={{ color: selectedProject?._id === p._id ? 'var(--accent-primary)' : 'var(--text-primary)' }}>{p.name}</strong>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{p.description}</p>
                </li>
              ))}
            </ul>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <p style={{ color: 'var(--text-muted)' }}>No projects found.</p>
            </div>
          )}
        </div>
        
        <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column' }}>
          {selectedProject ? (
              <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                      <h2 style={{ fontSize: '1.25rem' }}>Tasks: {selectedProject.name}</h2>
                      {user?.role === 'ADMIN' && (
                          <button className="btn btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }} onClick={() => setIsTaskModalOpen(true)}>+ Task</button>
                      )}
                  </div>
                  
                  {tasksLoading ? (
                      <p style={{ color: 'var(--text-secondary)' }}>Loading tasks...</p>
                  ) : tasks.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                          {tasks.map(task => (
                              <div key={task._id} style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                      <strong>{task.title}</strong>
                                      <select 
                                        value={task.status} 
                                        onChange={(e) => handleStatusChange(task._id, e.target.value)}
                                        className={`status-select ${task.status === 'TO DO' ? 'todo' : task.status === 'IN PROGRESS' ? 'progress' : 'done'}`}
                                      >
                                          <option value="TO DO">TO DO</option>
                                          <option value="IN PROGRESS">IN PROGRESS</option>
                                          <option value="DONE">DONE</option>
                                      </select>
                                  </div>
                                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{task.description}</p>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                      <span>Assigned to: {task.assignedTo ? task.assignedTo.name : 'Unassigned'}</span>
                                      <span>Status: <span style={{ color: task.status === 'DONE' ? 'var(--success)' : task.status === 'IN PROGRESS' ? 'var(--warning)' : 'var(--accent-primary)' }}>{task.status}</span></span>
                                  </div>
                              </div>
                          ))}
                      </div>
                  ) : (
                      <div style={{ textAlign: 'center', padding: '2rem 0', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <p style={{ color: 'var(--text-muted)' }}>No tasks for this project.</p>
                      </div>
                  )}
              </>
          ) : (
              <div style={{ textAlign: 'center', padding: '2rem 0', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <p style={{ color: 'var(--text-muted)' }}>Select a project to view tasks.</p>
              </div>
          )}
        </div>
      </div>

      <ProjectModal 
        isOpen={isProjectModalOpen} 
        onClose={() => setIsProjectModalOpen(false)} 
        onProjectCreated={handleProjectCreated} 
      />
      {selectedProject && (
          <TaskModal 
            isOpen={isTaskModalOpen}
            onClose={() => setIsTaskModalOpen(false)}
            onTaskCreated={handleTaskCreated}
            projectId={selectedProject._id}
          />
      )}
    </div>
  );
};

export default Dashboard;
