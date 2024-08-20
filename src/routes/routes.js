import React from "react";
import { Routes, Route } from 'react-router-dom';

import Home from "../pages/Home";
import AllProducts from "../pages/AllProducts";
import ProductDetails from "../pages/ProductDetails";
import Payment from "../pages/Payment";
import Account from "../pages/Account";
import AccountResetPassword from "../pages/Account/AccountResetPassword"; // Importando o AccountResetPassword

export default function RoutesApp() {
  return (
    <Routes>
      <Route path="*" element={<Home />} />
      <Route exact path="/" element={<Home />} />

      <Route path="/products" element={<AllProducts />} />
      <Route path="/product/:id" element={<ProductDetails />} />
      
      <Route path="/payment" element={<Payment />} />
      <Route path="/account" element={<Account />} />
      <Route path="/account/reset-password" element={<AccountResetPassword />} /> {/* Corrigido para usar AccountResetPassword */}
    </Routes>
  );
}
