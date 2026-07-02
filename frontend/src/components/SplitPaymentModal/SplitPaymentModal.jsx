import { useState } from "react";
import styles from "./SplitPaymentModal.module.css";

export default function SplitPaymentModal({ total, onClose, onConfirm }) {
  const [cash, setCash] = useState("");
  const [upi, setUpi] = useState("");

  // Dynamically compute real-time values from current input strings safely
  const cashValue = cash === "" ? 0 : Number(cash);
  const upiValue = upi === "" ? 0 : Number(upi);

  // Dynamic calculations provide an absolute source of mathematical truth
  const enteredTotal = cashValue + upiValue;
  
  // Math.max guarantees remaining calculations don't slip into strange negative integers
  const remaining = Math.max(0, Number((total - enteredTotal).toFixed(2)));

  const handleCashChange = (e) => {
    const value = e.target.value;

    if (value === "") {
      setCash("");
      setUpi("");
      return;
    }

    const amount = Number(value);
    if (amount < 0 || amount > total) return;

    setCash(value);
    setUpi(Number((total - amount).toFixed(2)).toString());
  };

  const handleUpiChange = (e) => {
    const value = e.target.value;

    if (value === "") {
      setUpi("");
      setCash("");
      return;
    }

    const amount = Number(value);
    if (amount < 0 || amount > total) return;

    setUpi(value);
    setCash(Number((total - amount).toFixed(2)).toString());
  };

  const handleConfirm = () => {
    // Strict comparison check handles fractional float values up to two decimal points safely
    if (Math.abs(enteredTotal - total) > 0.01) return;

    onConfirm(cashValue, upiValue);
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2>Split Payment</h2>

        <div className={styles.totalBox}>
          <span>Total Bill</span>
          <h1>₹{total.toFixed(2)}</h1>
        </div>

        <div className={styles.inputGroup}>
          <label>Cash Amount</label>
          <input
            type="number"
            min="0"
            max={total}
            step="0.01"
            value={cash}
            onChange={handleCashChange}
            placeholder="Enter Cash Amount"
          />
        </div>

        <div className={styles.inputGroup}>
          <label>UPI Amount</label>
          <input
            type="number"
            min="0"
            max={total}
            step="0.01"
            value={upi}
            onChange={handleUpiChange}
            placeholder="Enter UPI Amount"
          />
        </div>

        <div className={styles.summary}>
          <div>
            <span>Entered</span>
            <strong>₹{enteredTotal.toFixed(2)}</strong>
          </div>

          <div>
            <span>Remaining</span>
            <strong className={remaining === 0 ? styles.success : styles.error}>
              ₹{remaining.toFixed(2)}
            </strong>
          </div>
        </div>

        {remaining !== 0 && (
          <p className={styles.warning}>
            Cash + UPI must equal the total bill.
          </p>
        )}

        <div className={styles.actions}>
          <button className={styles.cancelBtn} onClick={onClose}>
            Cancel
          </button>

          <button
            className={styles.confirmBtn}
            disabled={remaining !== 0}
            onClick={handleConfirm}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
