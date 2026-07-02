import { useEffect, useState } from "react";
import api from "../../../services/api";
import styles from "./RecipeModal.module.css";
import RecipeIngredientRow from "../RecipeIngredientRow/RecipeIngredientRow";

export default function RecipeModal({ open, onClose, onSaved, recipe }) {
  const [materials, setMaterials] = useState([]);
  const [form, setForm] = useState({
    recipe_name: "",
    product_id: "", // Preserved for backend contract safety
    description: "",
    ingredients: [],
  });

  useEffect(() => {
    if (!open) return;
    loadDropdowns();
  }, [open]);

  const loadDropdowns = async () => {
    try {
      // Streamlined: Removed products data fetching pipeline
      const materialsResponse = await api.get("/recipes/raw-materials");
      setMaterials(materialsResponse.data);
    } catch (error) {
      console.error("Failed to load recipe initialization parameters:", error);
    }
  };

  useEffect(() => {
    if (!open) return;
    if (recipe) {
      loadRecipe(recipe.id);
    } else {
      setForm({
        recipe_name: "",
        product_id: "", 
        description: "",
        ingredients: [
          {
            raw_material_id: "",
            quantity_per_unit: "",
            unit: "Piece",
          },
        ],
      });
    }
  }, [recipe, open]);

  const loadRecipe = async (id) => {
    try {
      const response = await api.get(`/recipes/${id}`);
      setForm({
        recipe_name: response.data.recipe_name,
        product_id: response.data.product_id || "", 
        description: response.data.description || "",
        ingredients: response.data.ingredients,
      });
    } catch (error) {
      console.error("Failed to load targeted recipe layout profile:", error);
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleIngredientChange = (index, field, value) => {
    if (field === "raw_material_id") {
      const exists = form.ingredients.some(
        (item, i) => i !== index && item.raw_material_id === value
      );

      if (exists) {
        alert("Raw material already added to this formula list.");
        return;
      }
    }
    const updated = [...form.ingredients];
    updated[index][field] = value;
    setForm({
      ...form,
      ingredients: updated,
    });
  };

  const addIngredient = () => {
    setForm({
      ...form,
      ingredients: [
        ...form.ingredients,
        {
          raw_material_id: "",
          quantity_per_unit: "",
          unit: "Piece",
        },
      ],
    });
  };

  const removeIngredient = (index) => {
    if (form.ingredients.length === 1) {
      alert("Recipe requires at least one ingredient rows parameter setup.");
      return;
    }

    const updated = [...form.ingredients];
    updated.splice(index, 1);
    setForm({
      ...form,
      ingredients: updated,
    });
  };

  const saveRecipe = async () => {
    if (!form.recipe_name?.trim()) {
      alert("Please provide a distinct recipe title identifier.");
      return;
    }

    if (form.ingredients.length === 0) {
      alert("Add at least one ingredient item.");
      return;
    }

    const invalid = form.ingredients.some(
      (item) =>
        !item.raw_material_id ||
        !item.quantity_per_unit ||
        isNaN(item.quantity_per_unit) ||
        Number(item.quantity_per_unit) <= 0
    );

    if (invalid) {
      alert("Complete all ingredient rows using positive numbers.");
      return;
    }

    try {
      const initialResetForm = {
        recipe_name: "",
        product_id: "",
        description: "",
        ingredients: [
          {
            raw_material_id: "",
            quantity_per_unit: "",
            unit: "Piece",
          },
        ],
      };

      if (recipe) {
        await api.put(`/recipes/${recipe.id}`, form);
        setForm(initialResetForm);
      } else {
        await api.post("/recipes", form);
        setForm(initialResetForm);
      }
      onSaved();
      onClose();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Unable to complete recipe save operations.");
    }
  };

  if (!open) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2>{recipe ? "Edit Recipe" : "Create Recipe"}</h2>
        
        <label>Recipe Name</label>
        <input 
          type="text"
          name="recipe_name"
          placeholder="Enter Custom Recipe Name (e.g. Premium Batch Formula)"
          value={form.recipe_name} 
          onChange={handleChange} 
        />

        <label>Description</label>
        <textarea rows="3" name="description" value={form.description} onChange={handleChange} />
        
        <div className={styles.headerRow}>
          <h3>Ingredients</h3>
          <button type="button" className={styles.addIngredient} onClick={addIngredient}>
            + Add Ingredient
          </button>
        </div>

        {form.ingredients.map((ingredient, index) => (
          <RecipeIngredientRow
            key={index}
            index={index}
            ingredient={ingredient}
            materials={materials}
            onChange={handleIngredientChange}
            onRemove={removeIngredient}
          />
        ))}

        <div className={styles.actions}>
          <button className={styles.cancel} onClick={onClose}>
            Cancel
          </button>
          <button className={styles.save} onClick={saveRecipe}>
            {recipe ? "Update Recipe" : "Save Recipe"}
          </button>
        </div>
      </div>
    </div>
  );
}
