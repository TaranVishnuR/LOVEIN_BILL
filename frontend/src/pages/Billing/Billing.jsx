import { useState, useEffect } from "react";
import api from "../../../services/api"; // Fixed: Employs your central interceptor gateway

import styles from "./Billing.module.css";
import toast from "react-hot-toast";
import UtilityBar from "../../components/UtilityBar/UtilityBar";
import ProductGrid from "../../components/ProductGrid/ProductGrid";
import Cart from "../../components/Cart/Cart";
import ActionBar from "../../components/ActionBar/ActionBar";
import ProductModal from "../../components/ProductModal/ProductModal";
import ReactDOMServer from "react-dom/server";
import Receipt from "../../components/Receipt/Receipt";
import SplitPaymentModal from "../../components/SplitPaymentModal/SplitPaymentModal";

export default function Billing() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [paymentMethod, setPaymentMethod] = useState("");
  const [cashAmount, setCashAmount] = useState(0);
  const [upiAmount, setUpiAmount] = useState(0);
  const [showSplitModal, setShowSplitModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      // Fixed: Swapped axios with api to auto-include Authorization headers
      const response = await api.get("/products/active");

      const formattedProducts = response.data.map((product) => ({
        id: product.id,
        name: product.product_name,
        price: Number(product.selling_price),
        stock: product.stock_quantity,
        category: product.category,
      }));

      setProducts(formattedProducts);
    } catch (error) {
      console.error("Failed to load products", error);
      toast.error(error.response?.data?.message || "Failed to load products");
    }
  };

  const addToCart = (product) => {
    if (product.stock <= 0) {
      toast.error("Out of stock");
      return;
    }

    const existing = cart.find((item) => item.id === product.id);

    if (existing) {
      if (existing.quantity >= product.stock) {
        toast.error(`Only ${product.stock} available`);
        return;
      }

      setCart((prev) =>
        prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart((prev) => [...prev, { ...product, quantity: 1 }]);
    }
  };

  const clearCart = () => {
    setCart([]);
  };

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const increaseQuantity = (id) => {
    const product = products.find((p) => p.id === id);
    const cartItem = cart.find((item) => item.id === id);

    if (!product || !cartItem) return;

    if (cartItem.quantity >= product.stock) {
      toast.error(`${product.name}: Only ${product.stock} available`);
      return;
    }

    setCart((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decreaseQuantity = (id) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const handlePrintBill = async () => {
    if (isSaving) return;
    setIsSaving(true);

    if (cart.length === 0) {
      setIsSaving(false);
      return;
    }

    if (!paymentMethod) {
      toast.error("Select payment method");
      setIsSaving(false);
      return;
    }

    try {
      // Fixed: Swapped plain axios for our secure production API routing pipeline
      const response = await api.post("/sales", {
        total,
        items: cart,
        paymentMethod,
        cashAmount,
        upiAmount,
      });

      const billNumber = response.data.billNumber;

      const receiptHtml = ReactDOMServer.renderToStaticMarkup(
        <Receipt
          billNumber={billNumber}
          cart={cart}
          total={total}
          paymentMethod={paymentMethod}
          cashAmount={cashAmount}
          upiAmount={upiAmount}
        />
      );

      const printWindow = window.open("", "_blank", "width=400,height=700");

      printWindow.document.write(`
        <html>
          <head>
            <title>Receipt</title>
            <style>
              body { margin: 0; padding: 0; background: white; }
              .receipt { width: 80mm; padding: 8px; font-family: monospace; font-size: 12px; color: black; background: white; }
              .center { text-align: center; }
              .brand { font-size: 18px; font-weight: 700; }
              .company { font-size: 15px; font-weight: 700; margin-top: 2px; }
              .address { margin-top: 4px; }
              .line { border-top: 1px dashed black; margin: 10px 0; }
              .meta { display: flex; flex-direction: column; gap: 4px; }
              .tableHeader, .row { display: grid; grid-template-columns: 1fr 40px 70px; align-items: center; }
              .tableHeader { font-weight: 700; }
              .row { padding: 4px 0; }
              .itemName { word-break: break-word; }
              .totalRow { display: flex; justify-content: space-between; font-size: 16px; font-weight: 700; }
              .footer { text-align: center; line-height: 1.6; }
              @media print { body { margin: 0; } .receipt { width: 80mm; } }
            </style>
          </head>
          <body>
            ${receiptHtml}
          </body>
        </html>
      `);

      printWindow.document.close();
      printWindow.focus();

      setTimeout(async () => {
        toast.success(`Bill ${billNumber} saved successfully`);
        setCart([]);
        setPaymentMethod("");
        setCashAmount(0);
        setUpiAmount(0);

        await loadProducts();
        setIsSaving(false);

        printWindow.print();
        printWindow.onafterprint = () => {
          printWindow.close();
        };
      }, 500);

    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to save bill");
      setIsSaving(false);
    }
  };

  return (
    <div className={styles.page}>
      <UtilityBar
        onAddProduct={() => {
          setSelectedProduct(null);
          setShowModal(true);
        }}
        onEditProduct={() => setEditMode((prev) => !prev)}
        editMode={editMode}
      />

      <div className={styles.main}>
        <ProductGrid
          products={products}
          addToCart={addToCart}
          editMode={editMode}
          setSelectedProduct={setSelectedProduct}
          openEditModal={() => setShowModal(true)}
          onProductDeleted={loadProducts}
        />

        <Cart
          cart={cart}
          total={total}
          increaseQuantity={increaseQuantity}
          decreaseQuantity={decreaseQuantity}
        />
      </div>

      <ActionBar
        clearCart={clearCart}
        printBill={handlePrintBill}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        openSplitPayment={() => {
          if (cart.length === 0) {
            toast.error("Cart is empty");
            return;
          }
          setShowSplitModal(true);
        }}
        isSaving={isSaving}
      />

      {showSplitModal && (
        <SplitPaymentModal
          total={total}
          onClose={() => setShowSplitModal(false)}
          onConfirm={(cash, upi) => {
            setCashAmount(cash);
            setUpiAmount(upi);
            setPaymentMethod("SPLIT");
            setShowSplitModal(false);
          }}
        />
      )}

      {showModal && (
        <ProductModal
          product={selectedProduct}
          onClose={() => {
            setShowModal(false);
            setSelectedProduct(null);
          }}
          onProductAdded={() => {
            loadProducts();
            setSelectedProduct(null);
          }}
        />
      )}
    </div>
  );
}
