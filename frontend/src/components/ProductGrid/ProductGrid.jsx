import { useState } from "react";
import styles from "./ProductGrid.module.css";
import axios from "axios";
import toast from "react-hot-toast";
import { FaTrash } from "react-icons/fa";

export default function ProductGrid({
  products,
  addToCart,
  editMode,
  setSelectedProduct,
  openEditModal,
  onProductDeleted,
}) {
  const [deleteTarget, setDeleteTarget] =
    useState(null);

  const handleProductClick = (
    product
  ) => {
    if (editMode) {
      setSelectedProduct(
        product
      );

      openEditModal();
    } else {
      addToCart(product);
    }
  };

  const handleDeleteProduct =
    async (
      e,
      productId,
      productName
    ) => {
      e.stopPropagation();
      e.preventDefault();

      try {
        await axios.delete(
          `http://localhost:5000/api/products/${productId}`
        );

        toast.success(
          `${productName} deleted`
        );

        setDeleteTarget(null);

        onProductDeleted();
      } catch (error) {
        console.error(error);

        toast.error(
          "Failed to delete product"
        );
      }
    };

  return (
    <div className={styles.container}>
      <h2 className={styles.header}>
        Products
      </h2>

      <div className={styles.grid}>
        {[...products]
          .sort((a, b) => {
            if (
              a.stock <= 0 &&
              b.stock > 0
            )
              return 1;

            if (
              a.stock > 0 &&
              b.stock <= 0
            )
              return -1;

            return 0;
          })
          .map((product) => (
            <button
              key={product.id}
              className={styles.card}
              disabled={
                !editMode &&
                product.stock <= 0
              }
              onClick={() =>
                handleProductClick(
                  product
                )
              }
            >
              {editMode && (
                <div
                  className={
                    styles.deleteBtn
                  }
                  onClick={(e) => {
                    e.stopPropagation();

                    setDeleteTarget(
                      product.id
                    );
                  }}
                >
                  <FaTrash />
                </div>
              )}

              {deleteTarget ===
                product.id && (
                <div
                  className={
                    styles.deleteOverlay
                  }
                  onClick={(e) =>
                    e.stopPropagation()
                  }
                >
                  <div
                    className={
                      styles.deleteText
                    }
                  >
                    Delete
                    <br />
                    {product.name} ?
                  </div>

                  <div
                    className={
                      styles.deleteActions
                    }
                  >
                    <div
  className={styles.cancelBtn}
  onClick={(e) => {
    e.stopPropagation();
    setDeleteTarget(null);
  }}
>
  Cancel
</div>

                    <div
  className={styles.confirmDeleteBtn}
  onClick={(e) =>
    handleDeleteProduct(
      e,
      product.id,
      product.name
    )
  }
>
  Delete
</div>
                  </div>
                </div>
              )}

              <span
                className={styles.name}
              >
                {product.name}
              </span>

              <strong
                className={styles.price}
              >
                ₹{product.price}
              </strong>

              {product.stock > 0 ? (
                <span
                  className={
                    styles.stock
                  }
                >
                  Left:{" "}
                  {product.stock}
                </span>
              ) : (
                <span
                  className={
                    styles.outOfStock
                  }
                >
                  OUT OF STOCK
                </span>
              )}

              {editMode && (
                <span
                  className={
                    styles.editBadge
                  }
                >
                  EDIT
                </span>
              )}
            </button>
          ))}
      </div>
    </div>
  );
}