import { useEffect, useState } from "react";
import api from "../../../services/api";

import styles from "./RawMaterials.module.css";

import RawMaterialModal from "../../components/RawMaterialModal/RawMaterialModal";

export default function RawMaterials() {
  const [materials, setMaterials] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    loadMaterials();
  }, []);

  const loadMaterials = async () => {
    try {
      const response = await api.get("/raw-materials");
      setMaterials(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const filteredMaterials = materials.filter((material) => {
    const keyword = search.toLowerCase();

    return (
      (material.material_name || "")
        .toLowerCase()
        .includes(keyword) ||
      (material.supplier_name || "")
        .toLowerCase()
        .includes(keyword)
    );
  });

  const totalPurchases = materials.length;

  const lowStock = materials.filter(
    (m) =>
      Number(m.available_stock) <= Number(m.minimum_stock) &&
      Number(m.available_stock) > 0
  ).length;

  const outOfStock = materials.filter(
    (m) => Number(m.available_stock) === 0
  ).length;

  const totalValue = materials.reduce(
    (sum, item) => sum + Number(item.purchase_total_amount || 0),
    0
  );

  const getStatus = (material) => {
    const stock = Number(material.available_stock);
    const minimum = Number(material.minimum_stock);

    if (stock === 0) return "OUT OF STOCK";
    if (stock <= minimum) return "LOW";
    return "HEALTHY";
  };

  const deleteMaterial = async (id) => {
    try {
      await api.delete(`/raw-materials/${id}`);
      setDeleteId(null);
      await loadMaterials();
    } catch (error) {
      console.error(error);
      alert("Unable to delete material.");
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Raw Materials</h1>
        <button
          className={styles.addButton}
          onClick={() => {
            setSelectedMaterial(null);
            setShowModal(true);
          }}
        >
          + Add Material
        </button>
      </div>

      <div className={styles.cards}>
        <div className={styles.card}>
          <p>Total Purchases</p>
          <h2>{totalPurchases}</h2>
        </div>

        <div className={styles.card}>
          <p>Total Stock Value</p>
          <h2>₹{totalValue.toLocaleString()}</h2>
        </div>

        <div className={styles.card}>
          <p>Low Stock</p>
          <h2>{lowStock}</h2>
        </div>

        <div className={styles.card}>
          <p>Out of Stock</p>
          <h2>{outOfStock}</h2>
        </div>
      </div>

      <div className={styles.searchBar}>
        <input
          type="text"
          placeholder="Search Material..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className={styles.tableCard}>
        <table>
          <thead>
            <tr>
              <th>Material</th>
              <th>Category</th>
              <th>Purchased Qty</th>
              <th>Purchase Date</th>
              <th>Unit Price</th>
              <th>Total Amount</th>
              <th>Supplier</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredMaterials.map((material) => {
              if (deleteId === material.id) {
                return (
                  <tr key={material.id}>
                    <td colSpan="8" className={styles.deleteRow}>
                      <span>
                        Sure to delete
                        <strong> "{material.material_name}"</strong>?
                      </span>
                      <div className={styles.deleteButtons}>
                        <button
                          className={styles.cancelDelete}
                          onClick={() => setDeleteId(null)}
                        >
                          Cancel
                        </button>
                        <button
                          className={styles.confirmDelete}
                          onClick={() => deleteMaterial(material.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }

              return (
                <tr key={material.id}>
                  <td>{material.material_name}</td>
                  <td>{material.category}</td>
                  <td>
                    {material.available_stock} {material.unit}
                  </td>
                  <td>
                    {material.purchase_date
                      ? new Date(material.purchase_date).toLocaleDateString(
                          "en-IN",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          }
                        )
                      : "-"}
                  </td>
                  <td>
                    ₹{Number(material.cost_per_unit).toLocaleString()}
                  </td>
                  <td>
                    ₹{Number(material.purchase_total_amount || 0).toLocaleString()}
                  </td>
                  <td>{material.supplier_name}</td>
                  <td>
                    <span
                      className={`${styles.status} ${
                        styles[
                          getStatus(material)
                            .replaceAll(" ", "")
                            .toLowerCase()
                        ]
                      }`}
                    >
                      {getStatus(material)}
                    </span>
                  </td>
                  <td>
                    <button
                      className={styles.edit}
                      onClick={() => {
                        setSelectedMaterial(material);
                        setShowModal(true);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className={styles.delete}
                      onClick={() => setDeleteId(material.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}

            {filteredMaterials.length === 0 && (
              <tr>
                <td colSpan="8" className={styles.empty}>
                  No Materials Found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <RawMaterialModal
        open={showModal}
        material={selectedMaterial}
        onClose={() => {
          setShowModal(false);
          setSelectedMaterial(null);
        }}
        onSaved={loadMaterials}
      />
    </div>
  );
}
