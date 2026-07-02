import { useEffect, useState } from "react";
import axios from "axios";

import styles from "./SupplierModal.module.css";

export default function SupplierModal({
  open,
  onClose,
  onSaved,
  supplier,
}) {

  const [form, setForm] = useState({

    supplier_name: "",

    contact_person: "",

    phone: "",

    notes: "",

  });

  useEffect(() => {

    if (!open) return;

    if (supplier) {

      setForm({

        supplier_name:
          supplier.supplier_name,

        contact_person:
          supplier.contact_person || "",

        phone:
          supplier.phone,

        notes:
          supplier.notes || "",

      });

    } else {

      setForm({

        supplier_name: "",

        contact_person: "",

        phone: "",

        notes: "",

      });

    }

  }, [supplier, open]);

  const handleChange = (e) => {

    setForm({

      ...form,

      [e.target.name]:
        e.target.value,

    });

  };

  const handleSubmit =
    async (e) => {

      e.preventDefault();

      try {

        if (supplier) {

          await axios.put(

            `http://localhost:5000/api/suppliers/${supplier.id}`,

            form

          );

        } else {

          await axios.post(

            "http://localhost:5000/api/suppliers",

            form

          );

        }

        await onSaved();

        setForm({

          supplier_name: "",

          contact_person: "",

          phone: "",

          notes: "",

        });

        onClose();

      } catch (error) {

        console.error(error);

        alert(
          "Unable to save supplier."
        );

      }

    };

  if (!open) return null;

  return (

    <div className={styles.overlay}>

      <div className={styles.modal}>

        <h2>

          {supplier
            ? "Edit Supplier"
            : "Add Supplier"}

        </h2>

        <form
          onSubmit={handleSubmit}
        >

          <div className={styles.grid}>

            <input

              name="supplier_name"

              placeholder="Supplier Name"

              value={form.supplier_name}

              onChange={handleChange}

              required

            />

            <input

              name="contact_person"

              placeholder="Contact Person"

              value={form.contact_person}

              onChange={handleChange}

            />

            <input

              name="phone"

              placeholder="Phone Number"

              value={form.phone}

              onChange={handleChange}

              required

            />

          </div>

          <textarea

            name="notes"

            placeholder="Notes"

            value={form.notes}

            onChange={handleChange}

          />

          <div className={styles.buttons}>

            <button

              type="button"

              className={styles.cancel}

              onClick={onClose}

            >

              Cancel

            </button>

            <button

              type="submit"

              className={styles.save}

            >

              {supplier
                ? "Update"
                : "Save"}

            </button>

          </div>

        </form>

      </div>

    </div>

  );

}