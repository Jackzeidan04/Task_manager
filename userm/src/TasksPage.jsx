import { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "https://localhost:7008/api/tasks";

export function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    status: "Incomplete",
    priority: "Medium",
    dueDate: ""
  });

  const fetchTasks = (status = "") => {
    const params = new URLSearchParams();
    if (status) params.append("status", status);

    axios.get(`${API_URL}?${params.toString()}`)
      .then((response) => {
        setTasks(response.data);
        setError("");
      })
      .catch(() => {
        setError("Failed to fetch tasks");
      });
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (editingId) {
        await axios.put(`${API_URL}/${editingId}`, form);
      } else {
        await axios.post(API_URL, form);
      }

      setForm({ title: "", description: "", status: "Incomplete", priority: "Medium", dueDate: "" });
      setShowForm(false);
      setEditingId(null);
      fetchTasks(statusFilter);
    } catch (err) {
      setError(err.response?.data || "Failed to save task");
    }
  };

  const handleDelete = (id) => {
    if (!window.confirm("Delete this task?")) return;

    axios.delete(`${API_URL}/${id}`)
      .then(() => {
        fetchTasks(statusFilter);
      })
      .catch(() => {
        setError("Failed to delete task");
      });
  };

  const handleEdit = (task) => {
    setForm({
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : ""
    });
    setEditingId(task.id);
    setShowForm(true);
  };

  const toggleStatus = (task) => {
    const newStatus = task.status === "Completed" ? "Incomplete" : "Completed";
    axios.put(`${API_URL}/${task.id}`, {
      ...task,
      status: newStatus
    })
      .then(() => {
        fetchTasks(statusFilter);
      })
      .catch(() => {
        setError("Failed to update task");
      });
  };

  const filteredTasks = statusFilter
    ? tasks.filter(t => t.status === statusFilter)
    : tasks;

  return (
    <div className="tasks-container">
      <div className="task-header">
        <h1 className="task-title">Tasks</h1>
        <button
          className="add-task-btn"
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setForm({ title: "", description: "", status: "Incomplete", priority: "Medium", dueDate: "" });
          }}
        >
          + New Task
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {showForm && (
        <form className="task-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Task title"
                required
              />
            </div>
            <div className="form-group">
              <label>Priority</label>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            <div className="form-group">
              <label>Due Date</label>
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group form-textarea">
            <label>Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Optional details"
            />
          </div>

          <div className="form-buttons">
            <button type="submit" className="btn-submit">
              {editingId ? "Update Task" : "Create Task"}
            </button>
            <button
              type="button"
              className="btn-cancel"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="tasks-filter">
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            fetchTasks(e.target.value);
          }}
        >
          <option value="">All statuses</option>
          <option value="Incomplete">Incomplete</option>
          <option value="Completed">Completed</option>
        </select>
      </div>

      {filteredTasks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">◇</div>
          <div className="empty-text">No tasks logged. Create one to get started.</div>
        </div>
      ) : (
        <div className="tasks-list">
          {filteredTasks.map((task, index) => (
            <div
              key={task.id}
              className={`task-card priority-${task.priority.toLowerCase()}-edge`}
            >
              <div className="task-content">
                <span className="task-code">
                  TSK-{String(index + 1).padStart(3, '0')} · {new Date(task.createdAt).toLocaleDateString()}
                </span>
                <h3 className="task-name">{task.title}</h3>
                {task.description && <p className="task-description">{task.description}</p>}
                <div className="task-meta">
                  <span className={`task-badge status-${task.status.toLowerCase()}`}>
                    {task.status}
                  </span>
                  <span className={`priority-${task.priority.toLowerCase()}`}>
                    {task.priority} priority
                  </span>
                  {task.dueDate && (
                    <span className="task-due">
                      due {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
              <div className="task-actions">
                <button
                  className="btn-task-complete"
                  onClick={() => toggleStatus(task)}
                >
                  {task.status === "Completed" ? "Mark Incomplete" : "Mark Complete"}
                </button>
                <button className="btn-task-edit" onClick={() => handleEdit(task)}>
                  Edit
                </button>
                <button className="btn-task-delete" onClick={() => handleDelete(task.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}