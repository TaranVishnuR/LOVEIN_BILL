import { useState, useEffect } from "react";
import api from "../../../services/api"; // Fixed: Updated to use your secure centralized interceptor gateway

import styles from "./ProductModal.module.css";

export default function ProductModal({
  product,
  onClose,
  onProductAdded,
}) {
  const [productName, setProductName] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [stockQuantity, setStockQuantity] = useState("");
  const [category, setCategory] = useState("");

  useEffect(() => {
    if (product) {
      setProductName(product.name);
      setSellingPrice(product.price);
      setStockQuantity(product.stock);
      setCategory(product.category || "");
    }
  }, [product]);

  const handleSave = async () => {
    try {
      const payload = {
        productName,
        sellingPrice: Number(sellingPrice),
        stockQuantity: Number(stockQuantity),
        category,
      };

      if (product) {
        // Fixed: Routed operations through the api client wrapper to auto-inject authorization tokens
        await api.put(`/products/${product.id}`, payload);
      } else {
        await api.post("/products", payload);
      }

      onProductAdded();
      onClose();
    } catch (error) {
      console.error(error);
      // Fixed: Gracefully extracts precise status messages returned by your backend endpoint handlers
      alert(
        error.response?.data?.message || 
        (product ? "Failed to update product" : "Failed to add product")
      );
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2>
          {product ? "Edit Product" : "Add Product"}
        </h2>

        <input
          placeholder="Product Name"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
        />

        <input
          placeholder="Selling Price"
          type="number"
          value={sellingPrice}
          onChange={(e) => setSellingPrice(e.target.value)}
        />

        <input
          placeholder="Stock Quantity"
          type="number"
          value={stockQuantity}
          onChange={(e) => setStockQuantity(e.target.value)}
        />

        <input
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />

        <div className={styles.actions}>
          <button onClick={onClose}>
            Cancel
          </button>

          <button onClick={handleSave}>
            {product ? "Save Changes" : "Save Product"}
          </button>
        </div>
      </div>
    </div>
  );
}
