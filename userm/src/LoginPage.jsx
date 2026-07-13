import { useState } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";
import "./styles.css";

const API_URL = "https://localhost:7008/api/users";
const ADMIN_CODE = "ADMIN123"; // Change this to your secret code

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminCode, setAdminCode] = useState("");
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (isRegister) {
        if (password !== confirmPassword) {
          setError("Passwords do not match");
          setIsLoading(false);
          return;
        }

        if (isAdmin && adminCode !== ADMIN_CODE) {
          setError("Invalid admin code");
          setIsLoading(false);
          return;
        }

        const response = await axios.post(`${API_URL}/register`, {
          username,
          email,
          password,
          role: isAdmin ? "Admin" : "User"
        });
        login(response.data);
      } else {
        const response = await axios.post(`${API_URL}/login`, { email, password });
        login(response.data);
      }
    } catch (err) {
      setError(err.response?.data || "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-wrapper">
        <div className="login-card">
          <div className="login-header">
            <h1 className="login-title">{isRegister ? "Create Account" : "Login"}</h1>
            <p className="login-subtitle">
              {isRegister ? "Register a new account" : "Access your account"}
            </p>
          </div>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="form">
            {isRegister && (
              <div className="form-group">
                <label className="form-label">Username</label>
                <input
                  type="text"
                  placeholder="Choose a username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required={isRegister}
                  className="form-input"
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="form-input"
              />
            </div>

            {isRegister && (
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required={isRegister}
                  className="form-input"
                />
              </div>
            )}

            {isRegister && (
              <div className="admin-checkbox-group">
                <label className="admin-checkbox-label">
                  <input
                    type="checkbox"
                    checked={isAdmin}
                    onChange={(e) => setIsAdmin(e.target.checked)}
                    className="admin-checkbox-input"
                  />
                  <span>Register as Admin</span>
                </label>
              </div>
            )}

            {isRegister && isAdmin && (
              <div className="form-group">
                <label className="form-label">Admin Code</label>
                <input
                  type="password"
                  placeholder="Enter admin code"
                  value={adminCode}
                  onChange={(e) => setAdminCode(e.target.value)}
                  required={isAdmin}
                  className="form-input"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="submit-btn"
            >
              {isLoading ? "Loading..." : isRegister ? "Create Account" : "Login"}
            </button>
          </form>

          <div className="form-toggle">
            {isRegister ? "Already have an account? " : "Don't have an account? "}
            <button
              onClick={() => {
                setIsRegister(!isRegister);
                setError("");
                setEmail("");
                setPassword("");
                setUsername("");
                setConfirmPassword("");
                setIsAdmin(false);
                setAdminCode("");
              }}
              className="toggle-link"
            >
              {isRegister ? "Login" : "Register"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}