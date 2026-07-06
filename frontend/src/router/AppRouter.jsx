import { Routes, Route } from "react-router-dom";

import Login from "../pages/Login/Login";
import Billing from "../pages/Billing/Billing";

import Dashboard from "../pages/admin/Dashboard";
import Products from "../pages/admin/Products";
import Inventory from "../pages/admin/Inventory";
import Billing_Records from "../pages/admin/Billing_Records";
import Sessions from "../pages/admin/Sessions";
import Reports from "../pages/admin/Reports";

import AdminLayout from "../layouts/AdminLayout/AdminLayout.jsx";

import InventoryLayout from "../layouts/InventoryLayout/InventoryLayout";

import InventoryDashboard from "../pages/inventory/Dashboard";

import RawMaterials from "../pages/inventory/RawMaterials";

import Procurement from "../pages/inventory/Procurement";

import Suppliers from "../pages/inventory/Suppliers";

import Recipes from "../pages/inventory/Recipes";

import Production from "../pages/inventory/Production";

import Dispatch from "../pages/inventory/Dispatch";

import ProtectedRoute from "./ProtectedRoute";

export default function AppRouter() {
  return (
    <Routes>
      <Route
        path="/"
        element={<Login />}
      />

      <Route
        path="/billing"
        element={
          <ProtectedRoute
            allowedRoles={[
              "cashier",
            ]}
          >
            <Billing />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <ProtectedRoute
            allowedRoles={[
              "admin",
            ]}
          >
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route
          index
          element={<Dashboard />}
        />

        <Route
          path="products"
          element={<Products />}
        />

        <Route
          path="inventory"
          element={<Inventory />}
        />

        <Route
  path="bills"
  element={<Billing_Records />}
/>

        <Route
          path="sessions"
          element={<Sessions />}
        />

        <Route
          path="reports"
          element={<Reports />}
        />
      </Route>

        <Route
  path="/inventory"
  element={
    <ProtectedRoute
      allowedRoles={[
        "inventory",
      ]}
    >
      <InventoryLayout />
    </ProtectedRoute>
  }
>

  <Route
    index
    element={<InventoryDashboard />}
  />

  <Route
    path="raw-materials"
    element={<RawMaterials />}
  />

  <Route
    path="procurement"
    element={<Procurement />}
  />

  <Route
    path="suppliers"
    element={<Suppliers />}
  />

  <Route
    path="recipes"
    element={<Recipes />}
  />

  <Route
    path="production"
    element={<Production />}
  />

  <Route
    path="dispatch"
    element={<Dispatch />}
  />

</Route>
    </Routes>
  );
}