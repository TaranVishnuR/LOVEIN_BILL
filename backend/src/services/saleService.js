const { v4: uuidv4 } = require("uuid");
const db = require("../config/db");

exports.createSale = async (
  total,
  items,
  paymentMethod,
  cashAmount,
  upiAmount
) => {

  const client = await db.connect();

  try {

    await client.query("BEGIN");

    const saleId = uuidv4();

    const today = new Date();

    const billDate =
      today.toISOString().split("T")[0];

    // ==========================================
    // Bill Number
    // ==========================================

    const existing =
      await client.query(
        `
        SELECT last_number
        FROM bill_sequences
        WHERE bill_date = $1
        FOR UPDATE
        `,
        [billDate]
      );

    let sequenceNumber = 1;

    if (existing.rows.length > 0) {

      sequenceNumber =
        existing.rows[0].last_number + 1;

      await client.query(
        `
        UPDATE bill_sequences
        SET last_number = $1
        WHERE bill_date = $2
        `,
        [
          sequenceNumber,
          billDate,
        ]
      );

    } else {

      await client.query(
        `
        INSERT INTO bill_sequences
        (
          bill_date,
          last_number
        )
        VALUES ($1,$2)
        `,
        [
          billDate,
          1,
        ]
      );

    }

    const datePart =
      billDate.replaceAll("-", "");

    const billNumber =
      `LIN-${datePart}-${String(
        sequenceNumber
      ).padStart(4, "0")}`;

    // ==========================================
    // Payment Split
    // ==========================================

    let finalCash = 0;
    let finalUpi = 0;

    if (paymentMethod === "CASH") {

      finalCash = total;

    } else if (paymentMethod === "UPI") {

      finalUpi = total;

    } else {

      finalCash = Number(cashAmount);
      finalUpi = Number(upiAmount);

    }

    // ==========================================
    // Stock Validation
    // ==========================================

    for (const item of items) {

      const product =
        await client.query(
          `
          SELECT
            product_name,
            stock_quantity
          FROM products
          WHERE id = $1
          FOR UPDATE
          `,
          [item.id]
        );

      if (product.rows.length === 0) {
        throw new Error("Product not found.");
      }

      const currentStock =
        product.rows[0].stock_quantity;

      if (
        currentStock <
        item.quantity
      ) {

        throw new Error(
          `${product.rows[0].product_name} has only ${currentStock} left`
        );

      }

    }

    // ==========================================
    // Save Sale
    // ==========================================

    await client.query(
      `
      INSERT INTO sales
      (
        id,
        bill_number,
        total_amount,
        payment_method,
        cash_amount,
        upi_amount
      )
      VALUES
      ($1,$2,$3,$4,$5,$6)
      `,
      [
        saleId,
        billNumber,
        total,
        paymentMethod,
        finalCash,
        finalUpi,
      ]
    );

    // ==========================================
    // Save Sale Items
    // ==========================================

    for (const item of items) {

      await client.query(
        `
        INSERT INTO sale_items
        (
          id,
          sale_id,
          product_id,
          quantity,
          selling_price
        )
        VALUES
        ($1,$2,$3,$4,$5)
        `,
        [
          uuidv4(),
          saleId,
          item.id,
          item.quantity,
          item.price,
        ]
      );

      await client.query(
        `
        UPDATE products
        SET
          stock_quantity =
            stock_quantity - $1
        WHERE id = $2
        `,
        [
          item.quantity,
          item.id,
        ]
      );

    }

    await client.query("COMMIT");

    return {
      saleId,
      billNumber,
    };

  } catch (error) {

    await client.query("ROLLBACK");

    throw error;

  } finally {

    client.release();

  }

};