import { useEffect, useState } from "react";
import axios from "axios";

import styles from "./RawMaterialModal.module.css";

export default function RawMaterialModal({
  open,
  onClose,
  onSaved,
  material,
}) {

  const [form, setForm] = useState({
    material_name: "",
    category: "",
    unit: "",
    available_stock: "",
    minimum_stock: "",
    cost_per_unit: "",
    supplier_name: "",
    purchase_date: "",
    purchase_total_amount: "",
    description: "",
  });

  useEffect(() => {
    if (!open) return;

    if (material) {
      setForm({
        material_name: material.material_name || "",
        category: material.category || "",
        unit: material.unit || "",
        available_stock: material.available_stock !== undefined && material.available_stock !== null ? material.available_stock : "",
        minimum_stock: material.minimum_stock !== undefined && material.minimum_stock !== null ? material.minimum_stock : "",
        cost_per_unit: material.cost_per_unit !== undefined && material.cost_per_unit !== null ? material.cost_per_unit : "",
        supplier_name: material.supplier_name || "",
        purchase_date: material.purchase_date
          ? material.purchase_date.substring(0, 10)
          : "",
        purchase_total_amount:
  material.purchase_total_amount !== undefined &&
  material.purchase_total_amount !== null
    ? material.purchase_total_amount
    : "",
        description: material.description || "",
      });
    } else {
      setForm({
    material_name:"",
    category:"",
    unit:"",
    available_stock:"",
    minimum_stock:"",
    cost_per_unit:"",
    purchase_total_amount:"",
    supplier_name:"",
    purchase_date:"",
    description:"",
});
    }
  }, [material, open]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleCancel = () => {
    setForm({
  material_name: "",
  category: "",
  unit: "",
  available_stock: "",
  minimum_stock: "",
  cost_per_unit: "",
  purchase_total_amount: "",
  supplier_name: "",
  purchase_date: "",
  description: "",
});
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...form,
      available_stock: form.available_stock === "" ? 0 : Number(form.available_stock),
      minimum_stock: form.minimum_stock === "" ? 0 : Number(form.minimum_stock),
      cost_per_unit: form.cost_per_unit === "" ? 0 : Number(form.cost_per_unit),
      purchase_total_amount:
  form.purchase_total_amount === ""
    ? 0
    : Number(form.purchase_total_amount),
    };

    try {
      if (material) {
        await axios.put(
          `http://localhost:5000/api/raw-materials/${material.id}`,
          payload
        );
      } else {
        await axios.post(
          "http://localhost:5000/api/raw-materials",
          payload
        );
      }

      await onSaved();

      setForm({
  material_name: "",
  category: "",
  unit: "",
  available_stock: "",
  minimum_stock: "",
  cost_per_unit: "",
  purchase_total_amount: "",
  supplier_name: "",
  purchase_date: "",
  description: "",
});

      onClose();
    } catch (error) {
      console.error(error);
      alert("Unable to save material.");
    }
  };

  if (!open) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2>
          {material ? "Edit Raw Material" : "Add Raw Material"}
        </h2>

        <form onSubmit={handleSubmit}>
          <div className={styles.grid}>
            <input
              name="material_name"
              placeholder="Material Name"
              value={form.material_name}
              onChange={handleChange}
              required
            />

            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              required
            >
              <option value="">Select Category</option>
              <option value="Milk & Dairy">Milk & Dairy</option>
              <option value="Sweeteners">Sweeteners</option>
              <option value="Flavours">Flavours</option>
              <option value="Packaging">Packaging</option>
              <option value="Ingredients">Ingredients</option>
              <option value="Cleaning">Cleaning</option>
              <option value="Others">Others</option>
            </select>

            <select
              name="unit"
              value={form.unit}
              onChange={handleChange}
              required
            >
              <option value="">Select Unit</option>
              <option value="Kg">Kg</option>
              <option value="Gram">Gram</option>
              <option value="Litre">Litre</option>
              <option value="ml">ml</option>
              <option value="Piece">Piece</option>
              <option value="Bottle">Bottle</option>
              <option value="Packet">Packet</option>
              <option value="Box">Box</option>
            </select>

            <input
              type="number"
              step="0.01"
              name="available_stock"
              placeholder="Purchased Quantity"
              value={form.available_stock}
              onChange={handleChange}
            />

            <input
              type="number"
              step="0.01"
              name="minimum_stock"
              placeholder="Minimum Stock"
              value={form.minimum_stock}
              onChange={handleChange}
            />

            <input
              type="number"
              step="0.01"
              name="cost_per_unit"
              placeholder="Unit Price"
              value={form.cost_per_unit}
              onChange={handleChange}
            />

            <input
  type="number"
  step="0.01"
  name="purchase_total_amount"
  placeholder="Total Invoice Amount"
  value={form.purchase_total_amount}
  onChange={handleChange}
  required
/>

            <input
  name="supplier_name"
  placeholder="Supplier Name"
  value={form.supplier_name}
  onChange={handleChange}
  required
/>
          </div>

          <input
            type="date"
            name="purchase_date"
            value={form.purchase_date}
            onChange={handleChange}
            required
          />

          <textarea
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
          />

          <div className={styles.buttons}>
            <button
              type="button"
              className={styles.cancel}
              onClick={handleCancel}
            >
              Cancel
            </button>

            <button type="submit" className={styles.save}>
              {material ? "Update" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
