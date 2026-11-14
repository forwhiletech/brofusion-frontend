import { Route, Routes } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import AdminLayout from '../components/layout/AdminLayout';
import ProtectedRoute from './ProtectedRoute';
import AdminRoute from './AdminRoute';

import Home from '../pages/customer/Home';
import Shop from '../pages/customer/Shop';
import ProductDetails from '../pages/customer/ProductDetails';
import Cart from '../pages/customer/Cart';
import Wishlist from '../pages/customer/Wishlist';
import Checkout from '../pages/customer/Checkout';
import OrderSuccess from '../pages/customer/OrderSuccess';
import MyOrders from '../pages/customer/MyOrders';
import OrderDetails from '../pages/customer/OrderDetails';
import Login from '../pages/customer/Login';
import Register from '../pages/customer/Register';
import ForgotPassword from '../pages/customer/ForgotPassword';
import ResetPassword from '../pages/customer/ResetPassword';
import Profile from '../pages/customer/Profile';
import AddressManagement from '../pages/customer/AddressManagement';
import Contact from '../pages/customer/Contact';
import About from '../pages/customer/About';
import NotFound from '../pages/customer/NotFound';

import Dashboard from '../pages/admin/Dashboard';
import ProductManagement from '../pages/admin/ProductManagement';
import AddProduct from '../pages/admin/AddProduct';
import EditProduct from '../pages/admin/EditProduct';
import CategoryManagement from '../pages/admin/CategoryManagement';
import OrderManagement from '../pages/admin/OrderManagement';
import CustomerManagement from '../pages/admin/CustomerManagement';
import CouponManagement from '../pages/admin/CouponManagement';
import BannerManagement from '../pages/admin/BannerManagement';
import InventoryManagement from '../pages/admin/InventoryManagement';
import SalesReports from '../pages/admin/SalesReports';

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/product/:slug" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-success/:id" element={<OrderSuccess />} />
          <Route path="/orders" element={<MyOrders />} />
          <Route path="/orders/:id" element={<OrderDetails />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/addresses" element={<AddressManagement />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Route>

      <Route path="/admin/login" element={<Login admin />} />
      <Route path="/admin" element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<ProductManagement />} />
          <Route path="products/add" element={<AddProduct />} />
          <Route path="products/edit/:id" element={<EditProduct />} />
          <Route path="categories" element={<CategoryManagement />} />
          <Route path="orders" element={<OrderManagement />} />
          <Route path="customers" element={<CustomerManagement />} />
          <Route path="coupons" element={<CouponManagement />} />
          <Route path="banners" element={<BannerManagement />} />
          <Route path="inventory" element={<InventoryManagement />} />
          <Route path="reports" element={<SalesReports />} />
        </Route>
      </Route>
    </Routes>
  );
}
