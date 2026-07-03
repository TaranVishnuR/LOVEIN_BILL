import { NavLink, useNavigate } from "react-router-dom";
import api from "../../../../services/api";
import styles from "./Sidebar.module.css";

export default function Sidebar() {
  const navigate = useNavigate();

  const logout = async () => {
    try {
      await api.post(
        "/auth/logout",
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
    } catch (error) {
      console.error(error);
    }

    // Optimized: Changed from .clear() to preserve your local UI preferences, theme setups, and thermal printer hardware selections
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("sessionId");
    localStorage.removeItem("email");

    navigate("/");
  };

  return (
    <aside className={styles.sidebar}>
      <h1 className={styles.logo}>LOVEIN</h1>

      <p className={styles.role}>Administrator</p>

      <nav>
        <NavLink
          end
          to="/admin"
          className={({ isActive }) => (isActive ? styles.active : styles.link)}
        >
          Dashboard
        </NavLink>

        <NavLink
          to="/admin/products"
          className={({ isActive }) => (isActive ? styles.active : styles.link)}
        >
          Products
        </NavLink>

        <NavLink
          to="/admin/inventory"
          className={({ isActive }) => (isActive ? styles.active : styles.link)}
        >
          Inventory
        </NavLink>

        <NavLink
          to="/admin/bills"
          className={({ isActive }) => (isActive ? styles.active : styles.link)}
        >
          Billing Records
        </NavLink>

        <NavLink
          to="/admin/sessions"
          className={({ isActive }) => (isActive ? styles.active : styles.link)}
        >
          Sessions
        </NavLink>

        <NavLink
          to="/admin/reports"
          className={({ isActive }) => (isActive ? styles.active : styles.link)}
        >
          Reports
        </NavLink>
      </nav>

      <button onClick={logout} className={styles.logout}>
        Logout
      </button>
    </aside>
  );
}
