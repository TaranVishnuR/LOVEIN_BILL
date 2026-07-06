import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../services/api";
import styles from "./Login.module.css";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await api.post(
        "/auth/login",
        { email, password }
      );

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("email", email);
      localStorage.setItem("role", response.data.role);
      localStorage.setItem("sessionId", response.data.sessionId);

      if (response.data.role === "admin") {
        navigate("/admin");
      } else if (response.data.role === "inventory") {
        navigate("/inventory");
      } else {
        navigate("/billing");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid Email or Password");
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>LOVEIN</h1>
        <p className={styles.subtitle}></p>

        <form onSubmit={handleLogin} className={styles.form}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Email</label>
            <input
              className={styles.input}
              type="email"
              placeholder="Enter Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Password</label>
            {/* Added your clean CSS positioning wrapper */}
            <div className={styles.passwordWrapper}>
              <input
                className={`${styles.input} ${styles.passwordInput}`}
                type={showPassword ? "text" : "password"}
                placeholder="Enter Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={styles.eyeButton}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "" : ""}
              </button>
            </div>
          </div>

          <button type="submit" className={styles.button}>
            Login
          </button>

          {error && <p className={styles.error}>{error}</p>}
        </form>
      </div>
    </div>
  );
}
