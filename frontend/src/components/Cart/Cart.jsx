import styles from "./Cart.module.css";

export default function Cart({
  cart,
  total,
  increaseQuantity,
  decreaseQuantity,
}) {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
  <h2 className={styles.title}>
    Cart
  </h2>

  <div className={styles.headerTotal}>
    Total ₹{total}
  </div>
</div>

      <div className={styles.items}>
  {cart.map((item) => (
    <div
      key={item.id}
      className={styles.item}
    >
      <div className={styles.itemInfo}>
        <div className={styles.name}>
          {item.name}
        </div>

        <div
          className={styles.qtyControls}
        >
          <button
            className={styles.qtyBtn}
            onClick={() =>
              decreaseQuantity(
                item.id
              )
            }
          >
            -
          </button>

          <span
            className={styles.qty}
          >
            {item.quantity}
          </span>

          <button
            className={styles.qtyBtn}
            onClick={() =>
              increaseQuantity(
                item.id
              )
            }
          >
            +
          </button>
        </div>
      </div>

      <div className={styles.price}>
        ₹
        {item.price *
          item.quantity}
      </div>
    </div>
  ))}
</div>

     
    </div>
  );
}