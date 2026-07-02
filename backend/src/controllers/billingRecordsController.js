const billingRecordsService = require("../services/billingRecordsService");

exports.getBillingRecords = async (req, res) => {
  try {
    const filter = req.query.filter || "today";

    const [summary, bills] = await Promise.all([
      billingRecordsService.getBillingSummary(filter),
      billingRecordsService.getBillingRecords(filter),
    ]);

    res.json({
      summary,
      bills,
    });
  } catch (error) {
    console.error(error);
    const status = error.status || 500;
    res.status(status).json({
      message: error.message || "Failed to load billing records",
    });
  }
};

exports.exportToExcel = async (req, res) => {
  try {
    const filter = req.query.filter || "all";
    const data = await billingRecordsService.getBillingRecords(filter);

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename=Lovein_Sales_Report_${filter}.csv`);

    let csv = "\uFEFF";
    csv += "Bill Number,Date & Time,Payment Method,Cash Component,UPI Component,Total Amount\r\n";

    data.forEach((b) => {
      const date = new Date(b.created_at).toLocaleString("en-IN").replace(",", "");
      csv += `"${b.bill_number}","${date}","${b.payment_method}",${b.cash_amount || 0},${b.upi_amount || 0},${b.total_amount || 0}\r\n`;
    });

    return res.status(200).send(csv);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to generate Excel download." });
  }
};

exports.exportToPdfHtml = async (req, res) => {
  try {
    const filter = req.query.filter || "all";
    const [summary, bills] = await Promise.all([
      billingRecordsService.getBillingSummary(filter),
      billingRecordsService.getBillingRecords(filter)
    ]);

    let rowsHtml = "";
    bills.forEach((b) => {
      const date = new Date(b.created_at).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
      const payment = b.payment_method === "SPLIT" ? `Split (C: ₹${b.cash_amount} / U: ₹${b.upi_amount})` : b.payment_method;
      rowsHtml += `<tr><td>${b.bill_number}</td><td>${date}</td><td>${payment}</td><td>${b.total_items || 1}</td><td>\u20B9${Number(b.total_amount).toFixed(2)}</td></tr>`;
    });

    const htmlLayout = `
      <html>
        <head>
          <title>Sales Ledger</title>
          <style>
            body { font-family: sans-serif; padding: 24px; color: #334155; }
            h1 { margin: 0; font-size: 22px; color: #0f172a; }
            .grid { display: flex; gap: 12px; margin: 20px 0; }
            .card { border: 1px solid #e2e8f0; padding: 12px; flex: 1; border-radius: 6px; background: #f8fafc; }
            .card p { margin: 0; font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background: #f1f5f9; text-align: left; padding: 10px; font-size: 12px; color: #475569; border-bottom: 2px solid #cbd5e1; }
            td { padding: 10px; font-size: 13px; border-bottom: 1px solid #e2e8f0; }
          </style>
        </head>
        <body onload="window.print();">
          <h1>LOVEIN POS - Sales Ledger Report</h1>
          <p>Reporting Period Scope: <strong>${filter.toUpperCase()}</strong></p>
          <div class="grid">
            <div class="card"><p>Total Bills</p><strong>${summary.totalBills}</strong></div>
            <div class="card"><p>Total Revenue</p><strong>\u20B9${Number(summary.totalSales).toFixed(2)}</strong></div>
            <div class="card"><p>Cash Volume</p><strong>\u20B9${Number(summary.cashSales).toFixed(2)}</strong></div>
            <div class="card"><p>UPI Volume</p><strong>\u20B9${Number(summary.upiSales).toFixed(2)}</strong></div>
          </div>
          <table>
            <thead><tr><th>Bill No</th><th>Date</th><th>Payment</th><th>Items</th><th>Amount</th></tr></thead>
            <tbody>${rowsHtml}</tbody>
          </table>
        </body>
      </html>`;

    return res.status(200).send(htmlLayout);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to compile PDF print template." });
  }
};
