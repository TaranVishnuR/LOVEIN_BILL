import { useEffect, useState } from "react";
import api from "../../../services/api";
import styles from "./DispatchModal.module.css";

export default function DispatchModal({
  open,
  onClose,
  onSaved,
  dispatch,
}) {
  const [form, setForm] = useState({
    product_name: "",
    quantity: "",
    unit: "",
    dispatch_date: "",
    notes: "",
  });
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    if (dispatch) {
      setForm({
        product_name: dispatch.product_name || "",
        quantity:
          dispatch.quantity !== undefined && dispatch.quantity !== null
            ? dispatch.quantity
            : "",
        unit: dispatch.unit || "",
        dispatch_date: dispatch.dispatch_date
          ? dispatch.dispatch_date.substring(0, 10)
          : "",
        notes: dispatch.notes || "",
      });
    } else {
      setForm({
        product_name: "",
        quantity: "",
        unit: "",
        dispatch_date: "",
        notes: "",
      });
    }
  }, [dispatch, open]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // Blocks minus (-), plus (+), and exponential notations (e, E) on keypress
  const handleQuantityKeyDown = (e) => {
    const invalidSymbols = ["-", "+", "e", "E"];
    if (invalidSymbols.includes(e.key)) {
      e.preventDefault();
    }
  };

  // Sanitizes clipboard data to ensure only positive numbers get pasted
  const handleQuantityPaste = (e) => {
    const pastedData = e.clipboardData.getData("text");
    // Regular expression: matches anything that isn't a digit or a decimal point
    if (/[^0-9.]/.test(pastedData)) {
      e.preventDefault();
    }
  };

  const handleCancel = () => {
    setForm({
      product_name: "",
      quantity: "",
      unit: "",
      dispatch_date: "",
      notes: "",
    });
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...form,
      quantity: form.quantity === "" ? 0 : Number(form.quantity),
    };

    try {
      if (dispatch) {
        await api.put(`/dispatches/${dispatch.id}`, payload);
      } else {
        await api.post("/dispatches", payload);
      }

      await onSaved();
      handleCancel();
    } catch (error) {
      console.error("API Error details:", error);
      const backendMessage = error.response?.data?.message || "Unable to save dispatch.";
      alert(backendMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2>{dispatch ? "Edit Dispatch" : "New Dispatch"}</h2>

        <form onSubmit={handleSubmit}>
          <div className={styles.grid}>
            <input
              name="product_name"
              placeholder="Product Name"
              value={form.product_name}
              onChange={handleChange}
              required
              disabled={loading}
            />

            <input
              type="number"
              step="0.01"
              min="0.01" /* Prevents zero or negative manual submissions */
              name="quantity"
              placeholder="Quantity"
              value={form.quantity}
              onChange={handleChange}
              onKeyDown={handleQuantityKeyDown} /* Blocks symbols on keypress */
              onPaste={handleQuantityPaste} /* Blocks symbols on clipboard paste */
              required
              disabled={loading}
            />

            <select
              name="unit"
              value={form.unit}
              onChange={handleChange}
              required
              disabled={loading}
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
          </div>

          <input
            type="date"
            name="dispatch_date"
            value={form.dispatch_date}
            onChange={handleChange}
            required
            disabled={loading}
          />

          <textarea
            name="notes"
            placeholder="Notes"
            value={form.notes}
            onChange={handleChange}
            disabled={loading}
          />

          <div className={styles.buttons}>
            <button
              type="button"
              className={styles.cancel}
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className={styles.save}
              disabled={loading}
            >
              {loading ? "Saving..." : dispatch ? "Update" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
