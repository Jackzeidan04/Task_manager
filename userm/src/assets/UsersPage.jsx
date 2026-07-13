import { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "https://localhost:7008/api/users";

export function UsersPage({ isAdmin }) {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [error, setError] = useState("");
  const [availableRoles, setAvailableRoles] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editRole, setEditRole] = useState("");

  const fetchUsers = (search = "", selectedRole = "") => {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (selectedRole) params.append("role", selectedRole);

    axios.get(`${API_URL}?${params.toString()}`)
      .then((response) => {
        setUsers(response.data);
        setError("");
      })
      .catch((err) => {
        setError("Failed to fetch users");
      });
  };

  const fetchRoles = () => {
    axios.get(`${API_URL}/roles`)
      .then((response) => {
        setAvailableRoles(response.data);
      })
      .catch((err) => console.error("Error fetching roles:", err));
  };

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const handleSearch = (searchValue) => {
    setSearchQuery(searchValue);
    fetchUsers(searchValue, roleFilter);
  };

  const handleRoleFilterChange = (selectedRole) => {
    setRoleFilter(selectedRole);
    fetchUsers(searchQuery, selectedRole);
  };

  const startEdit = (user) => {
    setEditingId(user.id);
    setEditRole(user.role);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const handleUpdate = (id) => {
    const user = users.find(u => u.id === id);
    axios.put(`${API_URL}/${id}`, { role: editRole, username: user.username, email: user.email })
      .then(() => {
        setError("");
        cancelEdit();
        fetchUsers(searchQuery, roleFilter);
      })
      .catch((err) => {
        setError(err.response?.data || "Failed to update user");
      });
  };

  const handleDelete = (id) => {
    if (!window.confirm("Delete this user?")) return;

    axios.delete(`${API_URL}/${id}`)
      .then(() => {
        setError("");
        fetchUsers(searchQuery, roleFilter);
      })
      .catch((err) => {
        setError("Failed to delete user");
      });
  };

  return (
    <div className="dashboard-wrapper">
      <h2 className="dashboard-title">👥 Users Management</h2>

      {error && <div className="error-message">{error}</div>}

      <div className="search-section">
        <div className="search-wrapper">
          <input
            type="text"
            placeholder="Search username or email..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="search-input"
          />
          <select
            value={roleFilter}
            onChange={(e) => handleRoleFilterChange(e.target.value)}
            className="filter-select"
          >
            <option value="">All Roles</option>
            {availableRoles.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="table-container">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                {isAdmin && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>
                    {editingId === user.id && isAdmin ? (
                      <select
                        value={editRole}
                        onChange={(e) => setEditRole(e.target.value)}
                        className="role-select"
                      >
                        <option value="User">User</option>
                        <option value="Viewer">Viewer</option>
                        <option value="Admin">Admin</option>
                      </select>
                    ) : (
                      <span className={`role-${user.role.toLowerCase()}`}>
                        {user.role}
                      </span>
                    )}
                  </td>
                  {isAdmin && (
                    <td>
                      {editingId === user.id ? (
                        <div className="action-buttons">
                          <button
                            onClick={() => handleUpdate(user.id)}
                            className="btn-save"
                          >
                            Save
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="btn-cancel"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="action-buttons">
                          <button
                            onClick={() => startEdit(user)}
                            className="btn-edit"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="btn-delete"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {users.length === 0 && <div className="no-users">No users found</div>}
      </div>
    </div>
  );
}