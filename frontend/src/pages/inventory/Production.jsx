import { useEffect, useState } from "react";
import api from "../../../services/api"; // Fixed: Updated to use your secure centralized interceptor gateway

import styles from "./Production.module.css";
import ProductionModal from "../../components/ProductionModal/ProductionModal";

export default function Production() {
  const [productions, setProductions] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedProduction, setSelectedProduction] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    loadProductions();
  }, []);

  const loadProductions = async () => {
    try {
      // Fixed: Routed fetch via your centralized api instance to pass active security token headers
      const response = await api.get("/production");
      setProductions(response.data);
    } catch (error) {
      console.error("Failed to load production batch history ledger logs:", error);
    }
  };

  const filteredProductions = productions.filter((item) =>
    item.product_name
      ?.toLowerCase()
      .includes(search.toLowerCase())
  );

  const totalBatches = productions.length;

  const totalQuantity = productions.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0
  );

  const totalCost = productions.reduce(
    (sum, item) => sum + Number(item.total_cost || 0),
    0
  );

  const todayProduction = productions.filter(
    (item) =>
      new Date(item.production_date).toDateString() ===
      new Date().toDateString()
  ).length;

  const lastProduction =
    productions.length > 0
      ? new Date(
          Math.max(
            ...productions.map((item) =>
              new Date(item.production_date).getTime()
            )
          )
        ).toLocaleDateString("en-IN")
      : "-";

  const deleteProduction = async (id) => {
    try {
      // Fixed: Connected delete calls securely to the interceptor client pipeline
      await api.delete(`/production/${id}`);
      setDeleteId(null);
      loadProductions();
    } catch (error) {
      console.error(error);
      // Fixed: Gracefully handles precise response parameters returned by your controller layer
      alert(error.response?.data?.message || "Failed to remove the production batch record.");
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Production</h1>

        <button
          className={styles.addButton}
          onClick={() => {
            setSelectedProduction(null);
            setShowModal(true);
          }}
        >
          + Add Production
        </button>
      </div>

      <div className={styles.cards}>
        <div className={styles.card}>
          <p>Total Batches</p>
          <h2>{totalBatches}</h2>
        </div>

        <div className={styles.card}>
          <p>Today's Production</p>
          <h2>{todayProduction}</h2>
        </div>

        <div className={styles.card}>
          <p>Total Quantity Produced</p>
          <h2>{totalQuantity}</h2>
        </div>

        <div className={styles.card}>
          <p>Total Production Cost</p>
          <h2>₹{totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
        </div>

        <div className={styles.card}>
          <p>Last Production</p>
          <h2>{lastProduction}</h2>
        </div>
      </div>

      <div className={styles.searchBar}>
        <input
          type="text"
          placeholder="Search Product..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className={styles.tableCard}>
        <table>
          <thead>
            <tr>
              <th>S.No</th>
              <th>Batch No</th>
              <th>Product</th>
              <th>Produced Qty</th>
              <th>Total Cost</th>
              <th>Production Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredProductions.length === 0 ? (
              <tr>
                <td
                  colSpan="8"
                  style={{
                    textAlign: "center",
                    padding: "40px",
                  }}
                >
                  No Production Records Found
                </td>
              </tr>
            ) : (
              filteredProductions.map((item, index) => (
                // Fixed: Combined tracking variables to protect against row collision rendering bugs
                <tr key={`prod-batch-${item.id || item.batch_number}-${index}`}>
                  <td>{index + 1}</td>
                  <td>{item.batch_number}</td>
                  <td>{item.product_name}</td>
                  <td>{item.quantity}</td>
                  <td>
                    ₹{Number(item.total_cost || 0).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td>
                    {new Date(item.production_date).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric"
                    })}
                  </td>
                  <td>
                    <span className={styles.completed}>
                      Completed
                    </span>
                  </td>
                  <td>
                    {deleteId === item.id ? (
                      <div className={styles.inlineActions}>
                        <button
                          className={styles.cancel}
                          onClick={() => setDeleteId(null)}
                        >
                          Cancel
                        </button>
                        <button
                          className={styles.confirmDelete}
                          onClick={() => deleteProduction(item.id)}
                        >
                          Confirm
                        </button>
                      </div>
                    ) : (
                      <div className={styles.inlineActions}>
                        <button
                          className={styles.edit}
                          onClick={() => {
                            setSelectedProduction(item);
                            setShowModal(true);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className={styles.delete}
                          onClick={() => setDeleteId(item.id)}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ProductionModal
        open={showModal}
        production={selectedProduction}
        onClose={() => {
          setShowModal(false);
          setSelectedProduction(null);
        }}
        onSaved={loadProductions}
      />
    </div>
  );
}
