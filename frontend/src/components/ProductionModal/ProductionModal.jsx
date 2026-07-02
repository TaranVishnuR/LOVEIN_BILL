import { useEffect, useState } from "react";
import api from "../../../services/api";

import styles from "./ProductionModal.module.css";

export default function ProductionModal({
  open,
  onClose,
  onSaved,
  production,
}) {
  const [recipes, setRecipes] = useState([]); // Fixed: Changed from products state storage tracking lanes
  const [preview, setPreview] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  const [form, setForm] = useState({
    recipe_id: "", // Fixed: Aligned key identifiers to look up recipes instead of generic product fields
    quantity: "",
    production_date: "",
    notes: "",
  });

  useEffect(() => {
    if (!open) return;
    loadRecipesDropdown();
  }, [open]);

  const loadRecipesDropdown = async () => {
    try {
      // Fixed: Swapped products fetching route endpoint to grab your standalone master recipes catalog data array
      const response = await api.get("/recipes");
      setRecipes(response.data);
    } catch (error) {
      console.error("Failed to load recipes catalog for production initialization:", error);
    }
  };

  useEffect(() => {
    if (!open) return;

    if (production) {
      setForm({
        recipe_id: production.recipe_id || "",
        quantity: parseInt(production.quantity, 10).toString(),
        production_date: production.production_date?.split("T")[0],
        notes: production.notes || "",
      });
    } else {
      setForm({
        recipe_id: "",
        quantity: "",
        production_date: new Date().toISOString().split("T")[0],
        notes: "",
      });
      setPreview(null);
    }
  }, [production, open]);

  useEffect(() => {
    if (
      !form.recipe_id ||
      !form.quantity ||
      isNaN(form.quantity) ||
      parseInt(form.quantity, 10) <= 0
    ) {
      setPreview(null);
      return;
    }

    calculatePreview();
  }, [form.recipe_id, form.quantity]);

  const calculatePreview = async () => {
    try {
      setLoadingPreview(true);

      // Fixed: Passes the targeted recipe_id to the simulator instead of product_id context definitions
      const response = await api.post("/production-calculator/preview", {
        recipe_id: form.recipe_id,
        quantity: parseInt(form.quantity, 10),
      });

      setPreview(response.data);
    } catch (error) {
      console.error("Failed to compile operational batch simulation:", error);
      setPreview(null);
    } finally {
      setLoadingPreview(false);
    }
  };

  const changeHandler = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const saveProduction = async () => {
    if (!form.recipe_id || !form.quantity || !form.production_date) {
      alert("Please complete all required fields.");
      return;
    }

    if (preview && !preview.can_produce) {
      alert("Insufficient raw materials stock counts detected. Cannot compile run.");
      return;
    }

    try {
      const sanitizedForm = {
        ...form,
        quantity: parseInt(form.quantity, 10),
      };

      if (production) {
        await api.put(`/production/${production.id}`, sanitizedForm);
      } else {
        await api.post("/production", sanitizedForm);
      }

      onSaved();
      onClose();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Unable to complete production batch save.");
    }
  };

  if (!open) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2>
          {production ? "Edit Production Batch" : "Create Production Batch"}
        </h2>

        <div className={styles.formGroup}>
          {/* Fixed UI Header Markup mapping: Exposes active recipe selections */}
          <label>Recipe Profile</label>
          <select name="recipe_id" value={form.recipe_id} onChange={changeHandler}>
            <option value="">Select Recipe</option>
            {recipes.map((recipe) => (
              <option key={recipe.id} value={recipe.id}>
                {recipe.recipe_name}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label>Quantity (Batches)</label>
          <input
            type="number"
            min="1"
            step="1"
            name="quantity"
            value={form.quantity}
            onChange={changeHandler}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Production Date</label>
          <input
            type="date"
            name="production_date"
            value={form.production_date}
            onChange={changeHandler}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Notes / Manufacturing Context</label>
          <textarea rows="3" name="notes" value={form.notes} onChange={changeHandler} />
        </div>

        {loadingPreview && (
          <div className={styles.loading}>Calculating production simulation...</div>
        )}

        {preview && (
          <div className={styles.previewCard}>
            <h3>Production Preview Matrix</h3>
            <p><strong>Formulation Scope:</strong> {preview.recipe_name}</p>
            <p>
              <strong>Total Cost:</strong> ₹
              {Number(preview.total_cost || 0).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
            <p>
              <strong>Status:</strong>{" "}
              <span className={preview.can_produce ? styles.success : styles.error}>
                {preview.can_produce ? "Ready For Production" : "Insufficient Stock"}
              </span>
            </p>

            <table className={styles.previewTable}>
              <thead>
                <tr>
                  <th>Material</th>
                  <th>Need</th>
                  <th>Available</th>
                  <th>Remaining</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {(preview.ingredients || []).map((item, index) => (
                  <tr key={`prev-ing-${item.raw_material_id || index}`}>
                    <td>{item.material_name}</td>
                    <td>{item.required_quantity} {item.unit}</td>
                    <td>{item.available_stock} {item.unit}</td>
                    <td>{item.remaining_stock} {item.unit}</td>
                    <td>
                      <span className={item.enough_stock ? styles.good : styles.bad}>
                        {item.enough_stock ? "Enough" : "Low Stock"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className={styles.actions}>
          <button className={styles.cancel} onClick={onClose}>Cancel</button>
          <button
            className={styles.save}
            disabled={preview && !preview.can_produce}
            onClick={saveProduction}
          >
            {production ? "Update Batch" : "Create Batch"}
          </button>
        </div>
      </div>
    </div>
  );
}
