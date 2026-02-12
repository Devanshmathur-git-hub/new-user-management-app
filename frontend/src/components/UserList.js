import React from 'react';
import { CSVLink } from 'react-csv';

const UserList = ({ users, onEdit, onDelete, onView, onExportAll }) => {
  const csvData = users.map(user => ({
    id: user._id,
    name: user.name,
    email: user.email,
    phoneNo: user.phoneNo || '',
    role: user.role?.name || '',
    status: user.isActive !== false ? 'Active' : 'Inactive',
  }));

  return (
    <div className="users-section">
      <div className="users-section-header">
        <h3>Users</h3>
        <div className="export-buttons">
          <CSVLink className="csv-link" data={csvData} filename="users.csv">Export page to CSV</CSVLink>
          {onExportAll && (
            <button type="button" className="btn btn-ghost" onClick={onExportAll}>Export all to CSV</button>
          )}
        </div>
      </div>
      <div className="users-table-wrap">
        {users.length === 0 ? (
          <p className="users-list-empty">No users yet. Add one above.</p>
        ) : (
          <table className="users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.phoneNo || '—'}</td>
                  <td>{user.role?.name || '—'}</td>
                  <td><span className={`status-badge ${user.isActive !== false ? 'status-active' : 'status-inactive'}`}>{user.isActive !== false ? 'Active' : 'Inactive'}</span></td>
                  <td>
                    <div className="user-actions">
                      {onView && <button type="button" className="btn btn-ghost" onClick={() => onView(user)}>View</button>}
                      <button type="button" className="btn btn-ghost" onClick={() => onEdit(user)}>Edit</button>
                      <button type="button" className="btn btn-danger" onClick={() => onDelete(user._id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default UserList;