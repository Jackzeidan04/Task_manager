export function Navbar({ currentPage, setCurrentPage, currentUser, onLogout }) {
  return (
    <nav className="navbar">
      <div className="nav-wrapper">
        <div className="nav-brand">📋 TaskManager</div>
        <ul className="nav-links">
          <li>
            <button
              className={`nav-link ${currentPage === 'tasks' ? 'active' : ''}`}
              onClick={() => setCurrentPage('tasks')}
            >
              📝 My Tasks
            </button>
          </li>
          <li>
            <button
              className={`nav-link ${currentPage === 'users' ? 'active' : ''}`}
              onClick={() => setCurrentPage('users')}
            >
              👥 Users
            </button>
          </li>
          <li style={{ borderLeft: '1px solid #333', paddingLeft: '20px' }}>
            <span style={{ color: '#aaa' }}>{currentUser.username}</span>
          </li>
          <li>
            <button className="nav-link" onClick={onLogout} style={{ color: '#ff6b6b' }}>
              Logout
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
}