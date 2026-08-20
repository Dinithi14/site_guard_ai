import React, { useState, useEffect } from 'react';
import { listUsers, adminUpdateUser, deleteUser } from '../api/users';
import {
  Users as UsersIcon,
  ShieldCheck,
  UserCheck,
  UserX,
  Mail,
  Calendar,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const fetchUsersList = async () => {
    try {
      setLoading(true);
      const res = await listUsers();
      setUsers(res.data || []);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersList();
  }, []);

  const handleToggleActive = async (user) => {
    try {
      const newStatus = !user.is_active;
      await adminUpdateUser(user.id, { is_active: newStatus });
      setMessage(`User ${user.email} is now ${newStatus ? 'active' : 'deactivated'}.`);
      await fetchUsersList();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Failed to update user status:', err);
    }
  };

  const handleRoleChange = async (user, newRoleName) => {
    try {
      // Role 1 = ADMIN, 2 = USER
      const roleId = newRoleName === 'ADMIN' ? 1 : 2;
      await adminUpdateUser(user.id, { role_id: roleId });
      setMessage(`Updated role for ${user.email} to ${newRoleName}.`);
      await fetchUsersList();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Failed to update role:', err);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>
          User & Access Administration
        </h2>
        <p style={{ fontSize: '0.88rem', color: '#64748b' }}>
          Manage user accounts, assign ADMIN/USER roles, and control application security permissions
        </p>
      </div>

      {message && (
        <div className="alert-box success" style={{ marginBottom: '20px' }}>
          <CheckCircle2 size={18} />
          <span>{message}</span>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Registered Accounts ({users.length})</h3>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
            Loading users...
          </div>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined Date</th>
                  <th>Access Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="user-avatar" style={{ width: '32px', height: '32px', fontSize: '0.8rem' }}>
                          {u.first_name ? u.first_name[0].toUpperCase() : 'U'}
                        </div>
                        <span style={{ fontWeight: 600 }}>{u.first_name} {u.last_name}</span>
                      </div>
                    </td>
                    <td style={{ color: '#475569' }}>{u.email}</td>
                    <td>
                      <select
                        className="form-select"
                        style={{ width: '110px', padding: '4px 8px', fontSize: '0.8rem' }}
                        value={u.role?.name || 'USER'}
                        onChange={(e) => handleRoleChange(u, e.target.value)}
                      >
                        <option value="USER">USER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>
                    <td>
                      <span className={`badge ${u.is_active ? 'badge-completed' : 'badge-delayed'}`}>
                        {u.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ color: '#64748b', fontSize: '0.82rem' }}>
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td>
                      <button
                        onClick={() => handleToggleActive(u)}
                        className={`btn btn-sm ${u.is_active ? 'btn-danger' : 'btn-outline'}`}
                        style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                      >
                        {u.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;
