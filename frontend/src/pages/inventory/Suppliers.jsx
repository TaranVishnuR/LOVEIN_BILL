import { useEffect, useState } from "react";
import axios from "axios";

import styles from "./Suppliers.module.css";

import SupplierModal from "../../components/SupplierModal/SupplierModal";

export default function Suppliers() {

  const [suppliers, setSuppliers] =
    useState([]);

  const [materials, setMaterials] = 
    useState([]);

  const [search, setSearch] =
    useState("");

  const [showModal, setShowModal] =
    useState(false);

  const [selectedSupplier, setSelectedSupplier] =
    useState(null);

  const [deleteId, setDeleteId] =
    useState(null);

  useEffect(() => {

    loadSuppliers();

  }, []);

  const loadSuppliers = async () => {

    try {

      const response =
        await axios.get(
          "http://localhost:5000/api/suppliers"
        );

      setSuppliers(response.data);

      const materialResponse = await axios.get(
  "http://localhost:5000/api/raw-materials"
);

setMaterials(materialResponse.data);

    } catch (error) {

      console.error(error);

    }

  };

  const filteredSuppliers =
    suppliers.filter((supplier) =>
      (supplier.supplier_name || "")
        .toLowerCase()
        .includes(
          search.toLowerCase()
        )
    );

  const totalSuppliers = suppliers.length;

const activeSuppliers = suppliers.length;

const totalPurchases = suppliers.reduce(
  (sum, supplier) => sum + Number(supplier.total_purchases || 0),
  0
);

const totalPurchaseAmount = suppliers.reduce(
  (sum, supplier) => sum + Number(supplier.total_amount || 0),
  0
);

const purchaseDates = suppliers
  .filter((supplier) => supplier.last_purchase)
  .map((supplier) => new Date(supplier.last_purchase).getTime());

const lastPurchase =
  purchaseDates.length > 0
    ? new Date(Math.max(...purchaseDates)).toLocaleDateString("en-IN")
    : "-";

  // const lastPurchase = "-";

  const deleteSupplier =
    async (id) => {

      try {

        await axios.delete(
          `http://localhost:5000/api/suppliers/${id}`
        );

        setDeleteId(null);

        await loadSuppliers();

      } catch (error) {

        console.error(error);

        alert(
          "Unable to delete supplier."
        );

      }

    };

    const toggleSupplierStatus = async (id) => {

  try {

    await axios.patch(
      `http://localhost:5000/api/suppliers/${id}/status`
    );

    await loadSuppliers();

  } catch (error) {

    console.error(error);

    alert("Unable to update supplier status.");

  }

};

  return (

    <div className={styles.page}>

      <div className={styles.header}>

        <h1>
          Suppliers
        </h1>

        <button
          className={styles.addButton}
          onClick={() => {

            setSelectedSupplier(null);

            setShowModal(true);

          }}
        >
          + Add Supplier
        </button>

      </div>

      {/* Summary */}

      <div className={styles.cards}>

        <div className={styles.card}>
          <p>Total Suppliers</p>
          <h2>{totalSuppliers}</h2>
        </div>

        <div className={styles.card}>
          <p>Active Suppliers</p>
          <h2>{activeSuppliers}</h2>
        </div>

        <div className={styles.card}>
  <p>Products Purchased</p>
  <h2>{totalPurchases}</h2>
</div>

<div className={styles.card}>
  <p>Total Purchase Amount</p>
  <h2>₹{totalPurchaseAmount.toLocaleString()}</h2>
</div>

<div className={styles.card}>
  <p>Last Purchase</p>
  <h2>{lastPurchase}</h2>
</div>

      </div>

      {/* Search */}

      <div className={styles.searchBar}>

        <input
          type="text"
          placeholder="Search Supplier..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

      </div>

      {/* Table */}

      <div className={styles.tableCard}>

        <table>

          <thead>

            <tr>

              <th>S.No</th>

              <th>Supplier Name</th>

              <th>Contact Person</th>

              <th>Phone</th>

              <th>items</th>

              <th>qty</th>

              <th>Amount</th>

              <th>Last Purchase</th>

              <th>Actions</th>

            </tr>

          </thead>

          <tbody>

            {filteredSuppliers.map(
              (
                supplier,
                index
              ) => {

                if (
                  deleteId ===
                  supplier.id
                ) {

                  return (

                    <tr
                      key={supplier.id}
                    >

                      <td
                        colSpan="9"
                        className={
                          styles.deleteRow
                        }
                      >

                        <div className={styles.deleteContent}>

  <div className={styles.deleteMessage}>
    Are you sure you want to delete{" "}
    <strong>"{supplier.supplier_name}"</strong>?
  </div>

  <div className={styles.deleteButtons}>
    

                          <button
                            className={
                              styles.cancelDelete
                            }
                            onClick={() =>
                              setDeleteId(
                                null
                              )
                            }
                          >
                            Cancel
                          </button>

                          <button
                            className={
                              styles.confirmDelete
                            }
                            onClick={() =>
                              deleteSupplier(
                                supplier.id
                              )
                            }
                          >
                            Delete
                          </button>

                        </div>
                      
                      </div>

                      </td>

                    </tr>

                  );

                }

                return (

                  <tr
                    key={supplier.id}
                  >

                    <td>
                      {index + 1}
                    </td>

                    <td>
  <div className={styles.supplierInfo}>
    <span>{supplier.supplier_name}</span>

    <span
      className={
        supplier.is_active
          ? styles.activeBadge
          : styles.inactiveBadge
      }
    >
      {supplier.is_active ? "Active" : "Inactive"}
    </span>
  </div>
</td>

<td>{supplier.contact_person || "-"}</td>

<td>{supplier.phone || "-"}</td>

<td>{supplier.total_purchases}</td>

<td>{supplier.total_quantity}</td>

<td>
₹{Number(supplier.total_amount).toLocaleString()}
</td>

<td>
{
supplier.last_purchase
? new Date(
supplier.last_purchase
).toLocaleDateString("en-IN")
: "-"
}
</td>

                    <td>

                      <button
                        className={
                          styles.edit
                        }
                        onClick={() => {

                          setSelectedSupplier(
                            supplier
                          );

                          setShowModal(
                            true
                          );

                        }}
                      >
                        Edit
                      </button>

                      <button
                        className={
                          styles.delete
                        }
                        onClick={() =>
                          setDeleteId(
                            supplier.id
                          )
                        }
                      >
                        Delete
                      </button>

                      <button
  className={
    supplier.is_active
      ? styles.deactivate
      : styles.activate
  }
  onClick={() =>
    toggleSupplierStatus(supplier.id)
  }
>
  {supplier.is_active
    ? "Deactivate"
    : "Activate"}
</button>

                    </td>

                  </tr>

                );

              }
            )}

            {filteredSuppliers.length ===
              0 && (

              <tr>

                <td
                  colSpan="9"
                  className={
                    styles.empty
                  }
                >
                  No Suppliers Found
                </td>

              </tr>

            )}

          </tbody>

        </table>

      </div>

      <SupplierModal

        open={showModal}

        supplier={selectedSupplier}

        onClose={() => {

          setShowModal(false);

          setSelectedSupplier(
            null
          );

        }}

        onSaved={
          loadSuppliers
        }

      />

    </div>

  );

}