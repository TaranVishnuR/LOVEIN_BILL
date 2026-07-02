import { Outlet } from "react-router-dom";

import Sidebar from "../../components/admin/Sidebar/Sidebar";

import styles from "./AdminLayout.module.css";

export default function AdminLayout() {
  return (
    <div className={styles.layout}>
      <Sidebar />

      <main className={styles.content}>
        <Outlet />
      </main>
    </div>
  );
}