import { useEffect, useState } from "react";
import api from "../../../services/api"; 
import styles from "./Billing_Records.module.css";

const FILTERS = [
  { label: "Today", value: "today" },
  { label: "This Week", value: "week" },
  { label: "This Month", value: "month" },
  { label: "Last 6 Months", value: "6months" },
  { label: "This Year", value: "year" },
];

export default function Billing_Records() {
  const [filter, setFilter] = useState("today");
  const [loading, setLoading] = useState(true);
  const [exportModal, setExportModal] = useState({ open: false, type: "" });
  const [isExporting, setIsExporting] = useState(false);
  const [records, setRecords] = useState({
    summary: { totalBills: 0, totalSales: 0, cashSales: 0, upiSales: 0, splitBills: 0 },
    bills: [],
  });

  useEffect(() => {
    loadBills();
  }, [filter]);

  const loadBills = async () => {
    try {
      const response = await api.get("/billing-records", { params: { filter } });
      setRecords(response.data);
    } catch (error) {
      console.error("Failed to load billing records:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportTrigger = async (targetRange) => {
    // Immediately collapse the modal overlay to maintain fluid UI interactions
    setExportModal({ open: false, type: "" });
    
    // Retrieve authentication credentials and resolve download endpoints dynamically
    const token = localStorage.getItem("token");
    const routePath = exportModal.type === "EXCEL" ? "excel" : "pdf";
    
    // Updated to use the environment variable for direct browser downloads
    const downloadUrl = `${import.meta.env.VITE_API_URL}/api/billing-records/export/${routePath}?filter=${targetRange}&token=${token}`;

    if (exportModal.type === "PDF") {
      // PDF mode opens the system layout in a fresh background tab to trigger window.print() natively
      window.open(downloadUrl, "_blank");
    } else {
      // Excel mode instantiates an isolated anchor point link to trigger direct binary file streams instantly
      const anchorLink = document.createElement("a");
      anchorLink.href = downloadUrl;
      anchorLink.setAttribute("download", `Lovein_Sales_Report_${targetRange}.csv`);
      document.body.appendChild(anchorLink);
      anchorLink.click();
      document.body.removeChild(anchorLink);
    }
  };

  const generateExcelSpreadsheet = (data, range) => {
    let csvContent = "\uFEFF"; 
    csvContent += `LOVEIN POS BILLING REPORT (${range.toUpperCase()})\r\n`;
    csvContent += `Total Bills,${data.summary.totalBills},Total Sales,INR ${data.summary.totalSales},Cash Sales,INR ${data.summary.cashSales},UPI Sales,INR ${data.summary.upiSales},Split Bills,${data.summary.splitBills}\r\n\r\n`;
    csvContent += "Bill Number,Date & Time,Payment Method,Cash Component,UPI Component,Total Amount\r\n";

    data.bills.forEach((b) => {
      const dateTime = new Date(b.created_at).toLocaleString("en-IN").replace(",", "");
      const method = b.payment_method || "N/A";
      const cash = b.cash_amount || 0;
      const upi = b.upi_amount || 0;
      const total = b.total_amount || 0;
      csvContent += `"${b.bill_number}","${dateTime}","${method}",${cash},${upi},${total}\r\n`;
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `Lovein_Sales_Report_${range}_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generatePdfAccountingLedger = (data, range) => {
    const printWindow = window.open("", "_blank", "width=900,height=800");
    let tableRowsHtml = "";

    data.bills.forEach((b) => {
      const dateStr = new Date(b.created_at).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
      const payStr = b.payment_method === "SPLIT" ? `Split (C: ₹${b.cash_amount} / U: ₹${b.upi_amount})` : b.payment_method;
      tableRowsHtml += `
        <tr>
          <td>${b.bill_number}</td>
          <td>${dateStr}</td>
          <td>${payStr}</td>
          <td>${b.total_items || 1}</td>
          <td>₹${Number(b.total_amount).toFixed(2)}</td>
        </tr>`;
    });

    printWindow.document.write(`
      <html>
        <head>
          <title>Sales Ledger - ${range.toUpperCase()}</title>
          <style>
            body { font-family: system-ui, sans-serif; padding: 24px; color: #1e293b; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 20px; }
            h1 { margin: 0; font-size: 24px; color: #0f172a; }
            .meta { font-size: 13px; color: #64748b; }
            .summary-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; margin-bottom: 30px; }
            .card { background: #f8fafc; border: 1px solid #e2e8f0; padding: 12px; border-radius: 6px; }
            .card p { margin: 0 0 4px 0; font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 600; }
            .card h3 { margin: 0; font-size: 16px; color: #0f172a; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th { background: #f1f5f9; text-align: left; font-size: 12px; text-transform: uppercase; color: #475569; padding: 10px; border-bottom: 2px solid #cbd5e1; }
            td { padding: 10px; font-size: 13px; border-bottom: 1px solid #e2e8f0; }
            @media print { body { padding: 0; } .card { background: #f8fafc !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; } th { background: #f1f5f9 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1>LOVEIN - Sales Ledger Report</h1>
              <div class="meta">Timeframe Scope: <strong>${range.toUpperCase()}</strong></div>
            </div>
            <div class="meta" style="text-align: right;">Generated: ${new Date().toLocaleDateString("en-IN")}</div>
          </div>
          <div class="summary-grid">
            <div class="card"><p>Total Bills</p><h3>${data.summary.totalBills}</h3></div>
            <div class="card"><p>Total Revenue</p><h3>₹${Number(data.summary.totalSales).toFixed(2)}</h3></div>
            <div class="card"><p>Cash Volume</p><h3>₹${Number(data.summary.cashSales).toFixed(2)}</h3></div>
            <div class="card"><p>UPI Volume</p><h3>₹${Number(data.summary.upiSales).toFixed(2)}</h3></div>
            <div class="card"><p>Split Records</p><h3>${data.summary.splitBills}</h3></div>
          </div>
          <table>
            <thead>
              <tr><th>Bill No</th><th>Date & Time</th><th>Payment Matrix</th><th>Items</th><th>Amount</th></tr>
            </thead>
            <tbody>${tableRowsHtml}</tbody>
          </table>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 400);
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <h2>Loading Billing Records...</h2>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.topHeaderBar}>
        <h1 className={styles.title}>Billing Records</h1>
        <div className={styles.exportActionsContainer}>
          <button className={styles.exportPdfBtn} onClick={() => setExportModal({ open: true, type: "PDF" })}>
             Export PDF
          </button>
          <button className={styles.exportExcelBtn} onClick={() => setExportModal({ open: true, type: "EXCEL" })}>
             Export Excel
          </button>
        </div>
      </div>

      <div className={styles.filters}>
        {FILTERS.map((item) => (
          <button
            key={item.value}
            onClick={() => setFilter(item.value)}
            className={filter === item.value ? styles.activeFilter : styles.filterBtn}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
