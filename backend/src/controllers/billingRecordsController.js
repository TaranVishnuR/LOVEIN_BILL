const billingRecordsService = require("../services/billingRecordsService");

// ==========================================
// GET BILLING RECORDS
// ==========================================

exports.getBillingRecords = async (req, res) => {
  try {
    const filter = req.query.filter || "today";
    const search = req.query.search || "";

    const [summary, bills] = await Promise.all([
      billingRecordsService.getBillingSummary(filter),
      billingRecordsService.getBillingRecords(filter, search),
    ]);

    res.status(200).json({
      summary,
      bills,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to load billing records.",
    });
  }
};

// ==========================================
// EXPORT EXCEL
// ==========================================

exports.exportToExcel = async (req, res) => {
  try {
    const filter = req.query.filter || "today";
    const search = req.query.search || "";

    const bills = await billingRecordsService.getBillingRecords(
      filter,
      search
    );

    let csv = "\uFEFF";
    csv +=
      "Bill Number,Date & Time,Payment,Cash,UPI,Items,Amount\r\n";

    bills.forEach((bill) => {
      csv += `"${bill.bill_number}","${new Date(
        bill.created_at
      ).toLocaleString("en-IN")}","${bill.payment_method}",${
        bill.cash_amount
      },${bill.upi_amount},${bill.total_items},${
        bill.total_amount
      }\r\n`;
    });

    res.setHeader(
      "Content-Type",
      "text/csv; charset=utf-8"
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Lovein_Billing_${filter}.csv`
    );

    res.send(csv);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to export Excel.",
    });
  }
};

// ==========================================
// EXPORT PDF
// ==========================================

exports.exportToPdf = async (req, res) => {
  try {
    const filter = req.query.filter || "today";
    const search = req.query.search || "";

    const [summary, bills] = await Promise.all([
      billingRecordsService.getBillingSummary(filter),
      billingRecordsService.getBillingRecords(filter, search),
    ]);

    const rows = bills
      .map(
        (bill) => `
<tr>
<td>${bill.bill_number}</td>
<td>${new Date(bill.created_at).toLocaleString("en-IN")}</td>
<td>${bill.payment_method}</td>
<td>${bill.total_items}</td>
<td>₹${Number(bill.total_amount).toFixed(2)}</td>
</tr>
`
      )
      .join("");

    const html = `
<!DOCTYPE html>
<html>

<head>

<meta charset="UTF-8">

<title>LOVEIN Billing Report</title>

<style>

body{
font-family:Arial,sans-serif;
padding:30px;
color:#222;
}

h1{
margin-bottom:5px;
}

.summary{
display:flex;
gap:20px;
margin:20px 0;
}

.card{
border:1px solid #ccc;
padding:12px;
border-radius:6px;
min-width:140px;
}

table{
width:100%;
border-collapse:collapse;
margin-top:20px;
}

th,td{
border:1px solid #ddd;
padding:10px;
text-align:left;
}

th{
background:#f5f5f5;
}

</style>

</head>

<body onload="window.print()">

<h1>LOVEIN Billing Report</h1>

<p><b>Filter :</b> ${filter}</p>

<div class="summary">

<div class="card">
<b>Total Bills</b><br>
${summary.totalBills}
</div>

<div class="card">
<b>Total Sales</b><br>
₹${summary.totalSales}
</div>

<div class="card">
<b>Cash Sales</b><br>
₹${summary.cashSales}
</div>

<div class="card">
<b>UPI Sales</b><br>
₹${summary.upiSales}
</div>

<div class="card">
<b>Split Bills</b><br>
${summary.splitBills}
</div>

</div>

<table>

<thead>

<tr>
<th>Bill No</th>
<th>Date</th>
<th>Payment</th>
<th>Items</th>
<th>Amount</th>
</tr>

</thead>

<tbody>

${rows}

</tbody>

</table>

</body>

</html>
`;

    res.setHeader("Content-Type", "text/html");
    res.send(html);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to export PDF.",
    });
  }
};