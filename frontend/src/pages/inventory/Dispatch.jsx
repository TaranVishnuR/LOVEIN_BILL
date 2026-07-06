import { useEffect, useState, useMemo } from "react";
import api from "../../../services/api";
import styles from "./Dispatch.module.css";
import DispatchModal from "../../components/DispatchModal/DispatchModal";

export default function Dispatch() {
  const [dispatches, setDispatches] = useState([]);
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [selectedDispatch, setSelectedDispatch] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    loadDispatches();
  }, []);

  const loadDispatches = async () => {
    try {
      const response = await api.get("/dispatches");
      setDispatches(response.data);
    } catch (error) {
      console.error("Failed to load dispatches:", error);
    }
  };

  const deleteDispatch = async (id) => {
    try {
      await api.delete(`/dispatches/${id}`);
      setDeleteId(null);
      await loadDispatches();
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Unable to delete dispatch.");
    }
  };

  // --- Optimized Derived State Mechanics ---
  
  const filteredDispatches = useMemo(() => {
    const keyword = search.toLowerCase().trim();
    const today = new Date();
    
    return dispatches.filter((item) => {
      // 1. Search filter
      const matchesSearch = (item.product_name || "")
        .toLowerCase()
        .includes(keyword);
      if (!matchesSearch) return false;

      // 2. Date ranges filter
      if (dateFilter === "all" || !item.dispatch_date) return true;
      
      const dispatchDate = new Date(item.dispatch_date);

      switch (dateFilter) {
        case "today":
          return dispatchDate.toDateString() === today.toDateString();

        case "week": {
          const weekAgo = new Date();
          weekAgo.setDate(today.getDate() - 7);
          return dispatchDate >= weekAgo;
        }

        case "month":
          return (
            dispatchDate.getMonth() === today.getMonth() &&
            dispatchDate.getFullYear() === today.getFullYear()
          );

        case "6months": {
          const sixMonthsAgo = new Date();
          sixMonthsAgo.setMonth(today.getMonth() - 6);
          return dispatchDate >= sixMonthsAgo;
        }

        case "year":
          return dispatchDate.getFullYear() === today.getFullYear();

        default:
          return true;
      }
    });
  }, [dispatches, search, dateFilter]);

  const kpis = useMemo(() => {
    const todayStr = new Date().toDateString();
    const productSet = new Set();
    let unitsSum = 0;
    let todayCount = 0;

    dispatches.forEach((item) => {
      if (item.product_name) {
        productSet.add(item.product_name);
      }
      unitsSum += Number(item.quantity || 0);
      
      if (item.dispatch_date && new Date(item.dispatch_date).toDateString() === todayStr) {
        todayCount++;
      }
    });

    return {
      totalUnits: unitsSum,
      todayDispatches: todayCount,
      uniqueProductsCount: productSet.size,
    };
  }, [dispatches]);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Dispatch</h1>
        <button
          className={styles.addButton}
          onClick={() => {
            setSelectedDispatch(null);
            setShowModal(true);
          }}
        >
          + New Dispatch
        </button>
      </div>

      {/* --- KPI Scorecards Block --- */}
      <div className={styles.cards}>
        <div className={styles.card}>
          <p>Total Dispatches</p>
          <h2>{dispatches.length}</h2>
        </div>

        <div className={styles.card}>
          <p>Total Units</p>
          <h2>{kpis.totalUnits.toLocaleString("en-IN")}</h2>
        </div>

        <div className={styles.card}>
          <p>Today's Dispatches</p>
          <h2>{kpis.todayDispatches}</h2>
        </div>

        <div className={styles.card}>
          <p>Products</p>
          <h2>{kpis.uniqueProductsCount}</h2>
        </div>
      </div>

      {/* --- Filters Row --- */}
      <div className={styles.searchSection}>
        <div className={styles.searchBar}>
          <input
            type="text"
            placeholder="Search Product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className={styles.filterBar}>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="6months">Last 6 Months</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>

      {/* --- Layout Records Table --- */}
      <div className={styles.tableCard}>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Product</th>
              <th>Quantity</th>
              <th>Unit</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDispatches.map((item) => {
              if (deleteId === item.id) {
                return (
                  <tr key={item.id}>
                    <td colSpan="5" className={styles.deleteRow}>
                      <span>
                        Sure to delete <strong>"{item.product_name}"</strong>?
                      </span>
                      <div className={styles.deleteButtons}>
                        <button
                          className={styles.cancelDelete}
                          onClick={() => setDeleteId(null)}
                        >
                          Cancel
                        </button>
                        <button
                          className={styles.confirmDelete}
                          onClick={() => deleteDispatch(item.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }

              return (
                <tr key={item.id}>
                  <td>
                    {item.dispatch_date
                      ? new Date(item.dispatch_date).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "-"}
                  </td>
                  <td>{item.product_name}</td>
                  <td>{Number(item.quantity || 0).toLocaleString("en-IN")}</td>
                  <td>{item.unit}</td>
                  <td>
                    <button
                      className={styles.edit}
                      onClick={() => {
                        setSelectedDispatch(item);
                        setShowModal(true);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className={styles.delete}
                      onClick={() => setDeleteId(item.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}

            {filteredDispatches.length === 0 && (
              <tr>
                <td colSpan="5" className={styles.empty}>
                  No Dispatch Records Found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <DispatchModal
        open={showModal}
        dispatch={selectedDispatch}
        onClose={() => {
          setShowModal(false);
          setSelectedDispatch(null);
        }}
        onSaved={loadDispatches}
      />
    </div>
  );
}
