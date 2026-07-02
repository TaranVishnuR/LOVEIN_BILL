import { useNavigate } from "react-router-dom";
import api from "../../../services/api";
import styles from "./UtilityBar.module.css";

export default function UtilityBar({
  onAddProduct,
  onEditProduct,
  editMode,
}) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.patch("/sessions/logout");
    } catch (error) {
      console.error(error);
    }

    localStorage.removeItem("token");
    localStorage.removeItem("email");
    localStorage.removeItem("role");
    localStorage.removeItem("sessionId");

    navigate("/");
  };

  return (
    <div className={styles.bar}>
      <h1>LOVEIN</h1>

      <div className={styles.actions}>
        <button className={styles.addBtn} onClick={onAddProduct}>
          + Product
        </button>

        <button
          className={editMode ? styles.saveBtn : styles.editBtn}
          onClick={onEditProduct}
        >
          {editMode ? "save changes" : "Edit Product"}
        </button>

        <button className={styles.logoutBtn} onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}
