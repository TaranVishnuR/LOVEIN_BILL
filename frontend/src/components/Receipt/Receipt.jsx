import "./Receipt.css";

export default function Receipt({
  billNumber,
  cart,
  total,
  paymentMethod,
}) {
  const now = new Date();

  const date =
    now.toLocaleDateString("en-GB");

  const time =
    now.toLocaleTimeString(
      "en-IN",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );

  return (
    <div className="receipt">
      <div className="center">
        <div className="brand">
          LOVEIN
        </div>

        <div className="company">
          CREAMY DAY
        </div>

        <div className="address">
          Pollachi, Tamil Nadu
        </div>
      </div>

      <div className="line" />

      <div className="meta">
        <div>
          Bill No :
          {" "}
          {billNumber}
        </div>

        <div>
          Date :
          {" "}
          {date}
        </div>

        <div>
          Time :
          {" "}
          {time}
        </div>

        <div>
  Payment :
  {" "}
  {paymentMethod}
</div>
      </div>

      <div className="line" />

      <div className="tableHeader">
        <span>Item</span>
        <span>Qty</span>
        <span>Amount</span>
      </div>

      <div className="line" />

      {cart.map((item) => (
        <div
          key={item.id}
          className="row"
        >
          <span className="itemName">
            {item.name}
          </span>

          <span>
            {item.quantity}
          </span>

          <span>
            ₹
            {item.price *
              item.quantity}
          </span>
        </div>
      ))}

      <div className="line" />

      <div className="totalRow">
  <span>TOTAL</span>
  <span>₹ {total}</span>
</div>

      <div className="line" />

      <div className="footer">
        <div>
          Thank You
        </div>

        <div>
          Visit Again
        </div>
      </div>

      <div className="line" />
    </div>
  );
}