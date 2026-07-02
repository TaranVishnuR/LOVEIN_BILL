import { useEffect, useState } from "react";
import api from "../../../services/api"; // Fixed: Updated to use your secure centralized interceptor gateway

import styles from "./Recipes.module.css";
import RecipeModal from "../../components/RecipeModal/RecipeModal";
import RecipeViewerModal from "../../components/RecipeViewerModal/RecipeViewerModal";

export default function Recipes() {
  const [recipes, setRecipes] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [showViewer, setShowViewer] = useState(false);
  const [viewerRecipe, setViewerRecipe] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    loadRecipes();
  }, []);

  // =====================================================
  // Load Recipes
  // =====================================================
  const loadRecipes = async () => {
    try {
      // Fixed: Swapped plain axios for our secure interceptor to include active session tokens
      const response = await api.get("/recipes");
      setRecipes(response.data);
    } catch (error) {
      console.error("Failed to load recipes data profile list:", error);
    }
  };

  // =====================================================
  // Search
  // =====================================================
  const filteredRecipes = recipes.filter((recipe) =>
    (recipe.recipe_name || "").toLowerCase().includes(search.toLowerCase())
  );

  // =====================================================
  // Dashboard Cards
  // =====================================================
  const totalRecipes = recipes.length;
  const productsLinked = recipes.length;

  const totalIngredients = recipes.reduce(
    (sum, recipe) => sum + Number(recipe.ingredient_count || 0),
    0
  );

  // =====================================================
  // Delete Recipe
  // =====================================================
  const deleteRecipe = async (id) => {
    try {
      // Fixed: Swapped axios with your api wrapper to avoid auth route rejections
      await api.delete(`/recipes/${id}`);
      setDeleteId(null);
      loadRecipes();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Unable to delete recipe.");
    }
  };

  return (
    <div className={styles.page}>
      {/* ==========================================
          Header
      ========================================== */}
      <div className={styles.header}>
        <h1>Recipes</h1>

        <button
          className={styles.addButton}
          onClick={() => {
            setSelectedRecipe(null);
            setShowModal(true);
          }}
        >
          + Create Recipe
        </button>
      </div>

      {/* ==========================================
          Summary
      ========================================== */}
      <div className={styles.cards}>
        <div className={styles.card}>
          <p>Total Recipes</p>
          <h2>{totalRecipes}</h2>
        </div>

        <div className={styles.card}>
          <p>Products Linked</p>
          <h2>{productsLinked}</h2>
        </div>

        <div className={styles.card}>
          <p>Total Ingredients</p>
          <h2>{totalIngredients}</h2>
        </div>
      </div>

      {/* ==========================================
          Search
      ========================================== */}
      <div className={styles.searchBar}>
        <input
          type="text"
          placeholder="Search Recipe..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* ==========================================
          Table
      ========================================== */}
      <div className={styles.tableCard}>
        <table>
          <thead>
            <tr>
              <th>S.No</th>
              <th>Recipe</th>
              <th>Product</th>
              <th>Ingredients</th>
              <th>Updated</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredRecipes.map((recipe, index) => {
              if (deleteId === recipe.id) {
                return (
                  <tr key={`delete-${recipe.id || index}`}>
                    <td colSpan="6" className={styles.deleteRow}>
                      <div className={styles.deleteContent}>
                        <div className={styles.deleteMessage}>
                          Are you sure you want to delete
                          <strong> "{recipe.recipe_name}" </strong>?
                        </div>

                        <div className={styles.deleteButtons}>
                          <button
                            className={styles.cancelDelete}
                            onClick={() => setDeleteId(null)}
                          >
                            Cancel
                          </button>

                          <button
                            className={styles.confirmDelete}
                            onClick={() => deleteRecipe(recipe.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              }

              return (
                <tr key={`recipe-${recipe.id || index}`}>
                  <td>{index + 1}</td>
                  <td>{recipe.recipe_name}</td>
                  <td>{recipe.product_name}</td>
                  <td>{recipe.ingredient_count}</td>
                  <td>
                    {recipe.updated_at
                      ? new Date(recipe.updated_at).toLocaleDateString("en-IN")
                      : "-"}
                  </td>

                  <td>
                    <button
                      className={styles.view}
                      onClick={() => {
                        setViewerRecipe(recipe);
                        setShowViewer(true);
                      }}
                    >
                      View
                    </button>
                    <button
                      className={styles.edit}
                      onClick={() => {
                        setSelectedRecipe(recipe);
                        setShowModal(true);
                      }}
                    >
                      Edit
                    </button>

                    <button
                      className={styles.delete}
                      onClick={() => setDeleteId(recipe.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}

            {filteredRecipes.length === 0 && (
              <tr>
                <td colSpan="6" className={styles.empty}>
                  No Recipes Found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ==========================================
          Modals
      ========================================== */}
      <RecipeModal
        open={showModal}
        recipe={selectedRecipe}
        onClose={() => {
          setShowModal(false);
          setSelectedRecipe(null);
        }}
        onSaved={loadRecipes}
      />

      <RecipeViewerModal
        open={showViewer}
        recipe={viewerRecipe}
        onClose={() => {
          setShowViewer(false);
          setViewerRecipe(null);
        }}
      />
    </div>
  );
}
