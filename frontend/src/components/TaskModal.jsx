import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const TaskModal = ({ isOpen, onClose, onTaskCreated, projectId }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [users, setUsers] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (isOpen && user?.role === 'ADMIN') {
      const fetchUsers = async () => {
        try {
          const res = await axios.get('/api/auth/users', {
            headers: { Authorization: `Bearer ${user.token}` }
          });
          setUsers(res.data);
        } catch (error) {
          console.error('Failed to fetch users', error);
        }
      };
      fetchUsers();
    }
  }, [isOpen, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title,
        description,
        project: projectId,
      };
      if (assignedTo) {
          payload.assignedTo = assignedTo;
      }
      const res = await axios.post('/api/tasks', payload, {
          headers: { Authorization: `Bearer ${user.token}` }
      });
      onTaskCreated(res.data);
      setTitle('');
      setDescription('');
      setAssignedTo('');
      onClose();
    } catch (error) {
      console.error('Failed to create task', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div className="glass-panel animate-fade-in" style={{ padding: '2rem', width: '100%', maxWidth: '400px' }}>
        <h3 style={{ marginBottom: '1rem' }}>Create New Task</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Task Title</label>
            <input className="form-input" value={title} onChange={e => setTitle(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-input" value={description} onChange={e => setDescription(e.target.value)} rows="2" />
          </div>
          {user?.role === 'ADMIN' && (
            <div className="form-group">
                <label className="form-label">Assign To</label>
                <select className="form-input" value={assignedTo} onChange={e => setAssignedTo(e.target.value)}>
                    <option value="">Unassigned</option>
                    {users.map(u => (
                        <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                    ))}
                </select>
            </div>
          )}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Create Task</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
