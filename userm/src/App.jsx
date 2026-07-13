import { useState, useEffect } from "react";
import axios from "axios";
import { AuthProvider, useAuth } from "./AuthContext";
import { LoginPage } from "./LoginPage";
import { Navbar } from "./Navbar";
import { TasksPage } from "./TasksPage";
import { UsersPage } from "./UsersPage";
import "./styles.css";

const API_URL = "https://localhost:7008/api/users";

axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

function Dashboard() {
  const { currentUser, logout, isAdmin } = useAuth();
  const [currentPage, setCurrentPage] = useState("tasks");

  return (
    <div style={{ minHeight: "100vh", background: "#000" }}>
      <Navbar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        currentUser={currentUser}
        onLogout={logout}
      />
      <div style={{ padding: "20px" }}>
        {currentPage === "tasks" && <TasksPage />}
        {currentPage === "users" && <UsersPage isAdmin={isAdmin} />}
      </div>
    </div>
  );
}

function AppContent() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return isAuthenticated ? <Dashboard /> : <LoginPage />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}