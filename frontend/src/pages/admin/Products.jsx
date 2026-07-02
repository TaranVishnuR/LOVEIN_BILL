import { useEffect, useState } from "react";
import api from "../../../services/api"; // Updated: Employs your clean interceptor client
import AdminProductModal from "../../components/admin/AdminProductModal/AdminProductModal";
import styles from "./Products.module.css";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    // Fixed #8: Stripped away performance dragging background setInterval loops
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await api.get("/products");
      setProducts(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const toggleStatus = async (id) => {
    try {
      await api.patch(`/products/${id}/toggle-status`);
      loadProducts();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to toggle status");
    }
  };

  const filteredProducts = products.filter((product) =>
    (product.product_name || "")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const handleSave = async (form) => {
    try {
      if (selectedProduct) {
        await api.put(`/products/${selectedProduct.id}`, form);
      } else {
        await api.post("/products", form);
      }
      setSelectedProduct(null);
      setModalOpen(false);
      await loadProducts();
    } catch (error) {
      console.error(error);
      // Fixed #9: Clean data parsing captures exact error payload responses
      alert(error.response?.data?.message || "Failed to save product");
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Products</h1>
        <button
          className={styles.addBtn}
          onClick={() => {
            setSelectedProduct(null);
            setModalOpen(true);
          }}
        >
          + Add Product
        </button>
      </div>

      <input
        type="text"
        placeholder="Search product..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className={styles.search}
      />

      <div className={styles.table}>
        <div className={styles.tableHeader}>
          <span>Product</span>
          <span>Category</span>
          <span>Price</span>
          <span>Stock</span>
          <span>Status</span>
          <span>Actions</span>
        </div>

        {filteredProducts.map((product) => (
          <div key={product.id} className={styles.tableRow}>
            <span>{product.product_name}</span>
            <span>{product.category}</span>
            <span>₹{product.selling_price}</span>
            <span>{product.stock_quantity}</span>
            <span>{product.is_active ? "Active" : "Inactive"}</span>
            <div className={styles.actions}>
              <button
                className={styles.editBtn}
                onClick={() => {
                  setSelectedProduct(product);
                  setModalOpen(true);
                }}
              >
                Edit
              </button>
              <button
                className={styles.toggleBtn}
                onClick={() => toggleStatus(product.id)}
              >
                {product.is_active ? "Disable" : "Enable"}
              </button>
            </div>
          </div>
        ))}

        {/* Fixed #10: Context-aware conditional layout rendering strings */}
        {products.length === 0 && (
          <div className={styles.empty}>No products available inside the store.</div>
        )}
        {products.length > 0 && filteredProducts.length === 0 && (
          <div className={styles.empty}>No products match your current search query keywords.</div>
        )}
      </div>

      <AdminProductModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        product={selectedProduct}
      />
    </div>
  );
}
