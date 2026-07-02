import { useState, useEffect } from "react";

import styles from "./AdminProductModal.module.css";

export default function AdminProductModal({
  open,
  onClose,
  onSave,
  product,
}) {
  const [form, setForm] = useState({
    productName: "",
    sellingPrice: "",
    stockQuantity: "",
    category: "",
  });

  useEffect(() => {
    if (product) {
      setForm({
        productName:
          product.product_name || "",

        sellingPrice:
          product.selling_price || "",

        stockQuantity:
          product.stock_quantity || "",

        category:
          product.category || "",
      });
    } else {
      setForm({
        productName: "",
        sellingPrice: "",
        stockQuantity: "",
        category: "",
      });
    }
  }, [product]);

  if (!open) return null;

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]:
        e.target.value,
    });
  };

  const handleSubmit = () => {
    onSave({
      productName:
        form.productName,

      sellingPrice:
        Number(
          form.sellingPrice
        ),

      stockQuantity:
        Number(
          form.stockQuantity
        ),

      category:
        form.category,
    });
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2>
          {product
            ? "Edit Product"
            : "Add Product"}
        </h2>

        <input
          name="productName"
          placeholder="Product Name"
          value={form.productName}
          onChange={handleChange}
        />

        <input
          name="sellingPrice"
          type="number"
          placeholder="Selling Price"
          value={form.sellingPrice}
          onChange={handleChange}
        />

        <input
          name="stockQuantity"
          type="number"
          placeholder="Stock Quantity"
          value={form.stockQuantity}
          onChange={handleChange}
        />

        <input
          name="category"
          placeholder="Category"
          value={form.category}
          onChange={handleChange}
        />

        <div className={styles.actions}>
          <button
            type="button"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
          >
            {product
              ? "Update"
              : "Add Product"}
          </button>
        </div>
      </div>
    </div>
  );
}