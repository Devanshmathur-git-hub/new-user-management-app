import React, { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CSVLink } from 'react-csv';
import { AuthContext } from './AuthContext';
import UserList from './UserList';
import UserForm from './UserForm';

const API = 'http://localhost:5001/api';

const UserManagement = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(0);
  const [limit] = useState(10);
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewUser, setViewUser] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [showAuditLogs, setShowAuditLogs] = useState(false);
  const [exportAllData, setExportAllData] = useState([]);
  const exportAllRef = useRef(null);
  const { token, logout } = useContext(AuthContext);

  useEffect(() => {
    fetchUsers();
  }, [search, page, statusFilter]);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API}/users`, {
        params: { page, limit, search, status: statusFilter },
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data.users);
      setTotal(res.data.total);
      setPages(res.data.pages || 1);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleCreate = async (userData) => {
    try {
      await axios.post(`${API}/users`, userData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers();
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  const handleUpdate = async (id, userData) => {
    try {
      await axios.put(`${API}/users/${id}`, userData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers();
      setEditingUser(null);
      if (viewUser?._id === id) setViewUser(null);
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API}/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers();
      if (viewUser?._id === id) setViewUser(null);
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleViewUser = async (user) => {
    try {
      const res = await axios.get(`${API}/users/${user._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setViewUser(res.data);
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const handleExportAll = async () => {
    try {
      const res = await axios.get(`${API}/users`, {
        params: { page: 1, limit: 10000, search, status: statusFilter },
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = (res.data.users || []).map(u => ({
        id: u._id,
        name: u.name,
        email: u.email,
        phoneNo: u.phoneNo || '',
        role: u.role?.name || '',
        status: u.isActive !== false ? 'Active' : 'Inactive',
      }));
      setExportAllData(data);
    } catch (error) {
      console.error('Error exporting:', error);
    }
  };

  useEffect(() => {
    if (exportAllData.length > 0 && exportAllRef.current?.link) {
      const timer = setTimeout(() => {
        exportAllRef.current?.link?.click();
        setExportAllData([]);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [exportAllData]);

  const fetchAuditLogs = async () => {
    try {
      const res = await axios.get(`${API}/users/audit-logs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAuditLogs(res.data);
      setShowAuditLogs(true);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>User Management</h1>
        <div className="header-actions">
          <input className="search-input" type="text" placeholder="Search by name, email, phone…" value={search} onChange={(e) => setSearch(e.target.value)} />
          <select className="filter-status" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
            <option value="all">All status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <button className="btn btn-secondary" onClick={() => { logout(); navigate('/'); }}>Logout</button>
        </div>
      </header>

      <div className="form-card">
        <h3>{editingUser ? 'Edit user' : 'Add user'}</h3>
        <UserForm onSubmit={editingUser ? (data) => handleUpdate(editingUser._id, data) : handleCreate} initialData={editingUser} />
      </div>

      <UserList
        users={users}
        onEdit={setEditingUser}
        onDelete={handleDelete}
        onView={handleViewUser}
        onExportAll={handleExportAll}
      />

      {total > 0 && (
        <div className="pagination-wrap">
          <span className="pagination-info">Page {page} of {pages} ({total} users)</span>
          {pages > 1 && (
            <div className="pagination-buttons">
              <button type="button" className="btn btn-ghost" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</button>
              <button type="button" className="btn btn-ghost" disabled={page >= pages} onClick={() => setPage(p => p + 1)}>Next</button>
            </div>
          )}
        </div>
      )}

      {exportAllData.length > 0 && (
        <CSVLink ref={exportAllRef} data={exportAllData} filename="all-users.csv" style={{ display: 'none' }} />
      )}

      {viewUser && (
        <div className="modal-overlay" onClick={() => setViewUser(null)} role="dialog" aria-modal="true">
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>User details</h3>
            <div className="modal-detail-row"><strong>Name</strong><span>{viewUser.name}</span></div>
            <div className="modal-detail-row"><strong>Email</strong><span>{viewUser.email}</span></div>
            <div className="modal-detail-row"><strong>Phone</strong><span>{viewUser.phoneNo || '—'}</span></div>
            <div className="modal-detail-row"><strong>Role</strong><span>{viewUser.role?.name || '—'}</span></div>
            <div className="modal-detail-row"><strong>Status</strong><span>{viewUser.isActive !== false ? 'Active' : 'Inactive'}</span></div>
            <div className="modal-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setViewUser(null)}>Close</button>
              <button type="button" className="btn btn-primary" onClick={() => { setEditingUser(viewUser); setViewUser(null); }}>Edit</button>
            </div>
          </div>
        </div>
      )}

      <div className="audit-section">
        <button type="button" className="btn btn-ghost" onClick={fetchAuditLogs}>View Audit Logs</button>
        {showAuditLogs && (
          <div className="audit-panel">
            <div className="dashboard-header" style={{ marginBottom: 16 }}>
              <h3 style={{ margin: 0 }}>Audit Logs</h3>
              <button className="btn btn-ghost" onClick={() => setShowAuditLogs(false)}>Close</button>
            </div>
            <ul className="audit-list">
              {auditLogs.map(log => (
                <li key={log._id}>
                  <strong>{log.action}</strong> by {log.userId?.name} ({log.userId?.email}) on {log.targetUserId?.name} ({log.targetUserId?.email}) at {new Date(log.createdAt).toLocaleString()}
                  {log.details && <pre>{JSON.stringify(log.details, null, 2)}</pre>}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;