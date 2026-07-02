import { useEffect, useState } from "react";
import api from "../../../services/api"; // Fixed: Updated to use your secure centralized interceptor gateway
import styles from "./Sessions.module.css";

export default function Sessions() {
  const [sessions, setSessions] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fixed: Stripped away the performance-heavy setInterval pooling cycle loops
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      // Fixed: Swapped blind axios calls with your centralized interceptor to auto-inject authorization tokens
      const response = await api.get("/sessions");
      setSessions(response.data);
    } catch (error) {
      console.error("Failed to load user session metrics logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSessions = sessions.filter((session) =>
    (session.user_email || "")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className={styles.page}>
        <h2>Loading Session History...</h2>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <h1>Sessions</h1>

      <input
        type="text"
        placeholder="Search user..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className={styles.searchBar} // Styled anchor hooks for clean input visibility
      />

      <div className={styles.tableContainer}>
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Login</th>
              <th>Logout</th>
              <th>Status</th>
              <th>Result</th>
              <th>IP Address</th>
            </tr>
          </thead>
          <tbody>
            {filteredSessions.length === 0 ? (
              <tr>
                <td colSpan="6" className={styles.empty}>
                  No Session Log Patterns Match Your Filters
                </td>
              </tr>
            ) : (
              filteredSessions.map((session, index) => (
                // Fixed: Combined fields with fallback indices to protect against duplicate key rendering failures
                <tr key={`session-${session.id || index}`}>
                  <td>{session.user_email}</td>
                  <td>
                    {new Date(session.login_time).toLocaleString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td>
                    {session.logout_time
                      ? new Date(session.logout_time).toLocaleString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "-"}
                  </td>
                  <td>
                    <span
                      className={
                        session.session_status === "ACTIVE"
                          ? styles.active
                          : styles.logout
                      }
                    >
                      {session.session_status}
                    </span>
                  </td>
                  <td>
                    <span
                      className={
                        session.login_result === "SUCCESS"
                          ? styles.success
                          : styles.failed
                      }
                    >
                      {session.login_result || "N/A"}
                    </span>
                  </td>
                  <td>{session.ip_address || "UNKNOWN"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
