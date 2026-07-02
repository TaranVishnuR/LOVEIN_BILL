import { useEffect, useState } from "react";
import api from "../../../services/api"; // Fixed: Updated to use your secure centralized interceptor gateway
import styles from "./RecipeViewerModal.module.css";

export default function RecipeViewerModal({
  open,
  recipe,
  onClose,
}) {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      setDetails(null);
      setLoading(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open || !recipe) return;
    loadRecipe();
  }, [open, recipe]);

  const loadRecipe = async () => {
    try {
      setLoading(true);
      // Fixed: Swapped plain axios for our secure interceptor client to auto-inject authorization tokens
      const response = await api.get(`/recipes/${recipe.id}`);
      
      // Fixed: Gracefully handles whether the backend payload returns a raw first index row or a rows wrapper array
      const recipeData = response.data?.id ? response.data : response.data?.[0];
      setDetails(recipeData || response.data);
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Unable to load recipe details.");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>
            {details ? details.recipe_name : "Recipe Details"}
          </h2>
          <button className={styles.close} onClick={onClose}>
            ×
          </button>
        </div>

        {loading ? (
          <div className={styles.loading}>Loading recipe...</div>
        ) : details ? (
          <>
            <div className={styles.summaryGrid}>
              <div className={styles.card}>
                <span>Product Mapping</span>
                <strong>{details.product_name || "Standalone Formula"}</strong>
              </div>

              <div className={styles.card}>
                <span>Recipe name</span>
                <strong>{details.recipe_name}</strong>
              </div>

              <div className={styles.card}>
                <span>Ingredients Count</span>
                <strong>{details.ingredient_count || 0}</strong>
              </div>

              <div className={styles.card}>
                <span>Estimated Cost</span>
                <strong>
                  ₹{Number(details.estimated_recipe_cost || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </strong>
              </div>
            </div>

            <div className={styles.descriptionCard}>
              <h3>Description</h3>
              <p>{details.description || "No description available."}</p>
            </div>

            <h3 className={styles.sectionTitle}>
              Ingredients
            </h3>

            <table className={styles.table}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Material</th>
                  <th>Qty Needed</th>
                  <th>Unit</th>
                  <th>Available</th>
                  <th>Cost / Unit</th>
                  <th>Ingredient Cost</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {details.ingredients?.length ? (
                  details.ingredients.map((item, index) => (
                    <tr key={`ing-row-${item.id || item.raw_material_id || index}`}>
                      <td>{index + 1}</td>
                      <td>{item.material_name}</td>
                      <td>{item.quantity_per_unit}</td>
                      <td>{item.unit}</td>
                      <td>
                        {item.available_stock} {item.unit}
                      </td>
                      <td>₹{Number(item.cost_per_unit || 0).toFixed(2)}</td>
                      <td>₹{Number(item.ingredient_cost || 0).toFixed(2)}</td>
                      <td>
                        <span
                          className={
                            Number(item.available_stock || 0) >=
                            Number(item.quantity_per_unit || 0)
                              ? styles.good
                              : styles.bad
                          }
                        >
                          {Number(item.available_stock || 0) >=
                          Number(item.quantity_per_unit || 0)
                            ? "Enough"
                            : "Low"}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className={styles.empty}>
                      No ingredients inside this.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </>
        ) : (
          <div className={styles.loading}>No recipe details found.</div>
        )}

        {details && (
          <div className={styles.totalCost}>
            <div className={styles.totalCostLabel}>
              Estimated Cost
            </div>
            <strong>
              ₹{Number(details.estimated_recipe_cost || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </strong>
          </div>
        )}

        <div className={styles.actions}>
          <button className={styles.closeButton} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
