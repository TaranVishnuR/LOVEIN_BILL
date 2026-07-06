import { Outlet, NavLink, useNavigate } from "react-router-dom";
import api from "../../../services/api"; // Fixed: Updated to use your secure centralized interceptor gateway
import styles from "./InventoryLayout.module.css";
import PWAInstallButton from "../../components/PWAInstallButton/PWAInstallButton";

export default function InventoryLayout() {
  const navigate = useNavigate();

  const logout = async () => {
    try {
      // Fixed: Swapped plain axios for our secure interceptor to automatically include active session headers
      await api.patch("/sessions/logout");
    } catch (error) {
      console.error("Server session tracking cleanup failed:", error);
    }

    // Fixed: Swapped .clear() for precise target key drops to preserve machine and layout preferences
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    localStorage.removeItem("role");
    localStorage.removeItem("sessionId");

    navigate("/");
  };

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <h1 className={styles.logo}>LOVEIN</h1>
        <p className={styles.role}>Inventory Manager</p>

        <nav>
  <NavLink
    end
    to="/inventory"
    className={({ isActive }) => (isActive ? styles.active : styles.link)}
  >
    Dashboard
  </NavLink>

  <NavLink
    to="/inventory/raw-materials"
    className={({ isActive }) => (isActive ? styles.active : styles.link)}
  >
    Raw Materials
  </NavLink>

  <NavLink
    to="/inventory/procurement"
    className={({ isActive }) => (isActive ? styles.active : styles.link)}
  >
    Procurement
  </NavLink>

  <NavLink
    to="/inventory/suppliers"
    className={({ isActive }) => (isActive ? styles.active : styles.link)}
  >
    Suppliers
  </NavLink>

  <NavLink
    to="/inventory/recipes"
    className={({ isActive }) => (isActive ? styles.active : styles.link)}
  >
    Recipes
  </NavLink>

  <NavLink
    to="/inventory/production"
    className={({ isActive }) => (isActive ? styles.active : styles.link)}
  >
    Production
  </NavLink>

  <NavLink
    to="/inventory/dispatch"
    className={({ isActive }) => (isActive ? styles.active : styles.link)}
  >
    Dispatch
  </NavLink>
</nav>

        <PWAInstallButton />

        <button onClick={logout} className={styles.logout}>
          Logout
        </button>
      </aside>

      <main className={styles.content}>
        <Outlet />
      </main>
    </div>
  );
}
