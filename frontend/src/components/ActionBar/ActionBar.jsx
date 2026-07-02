import styles from "./ActionBar.module.css";

export default function ActionBar({
  clearCart,
  printBill,
  paymentMethod,
  setPaymentMethod,
  openSplitPayment,
  isSaving,
}) {
  return (
    <div className={styles.bar}>
      <div className={styles.buttons}>

        {/* CASH */}

        <button
          className={`${styles.paymentBtn} ${
            paymentMethod === "CASH"
              ? styles.activePayment
              : ""
          }`}
          onClick={() =>
            setPaymentMethod("CASH")
          }
        >
          CASH
        </button>

        {/* UPI */}

        <button
          className={`${styles.paymentBtn} ${
            paymentMethod === "UPI"
              ? styles.activePayment
              : ""
          }`}
          onClick={() =>
            setPaymentMethod("UPI")
          }
        >
          UPI
        </button>

        {/* CASH + UPI */}

        <button
          className={`${styles.paymentBtn} ${
            paymentMethod === "SPLIT"
              ? styles.activePayment
              : ""
          }`}
          onClick={openSplitPayment}
        >
          CASH / UPI
        </button>

        {/* CLEAR */}

        <button
          className={`${styles.button} ${styles.clearBtn}`}
          onClick={clearCart}
        >
          Clear Cart
        </button>

        {/* PRINT */}

        <button
          className={`${styles.button} ${styles.printBtn}`}
          onClick={printBill}
          disabled={
            !paymentMethod ||
            isSaving
          }
        >
          {isSaving
            ? "Saving..."
            : "Print Bill"}
        </button>

      </div>
    </div>
  );
}