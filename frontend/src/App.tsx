import { Routes, Route } from "react-router";
import Navbar from "@/components/layout/Navbar";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import BuatMasakan from "@/pages/BuatMasakan";
import DaftarMasakan from "@/pages/DaftarMasakan";

export default function App() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/masakan/buat" element={<BuatMasakan />} />
          <Route path="/masakan/saya" element={<DaftarMasakan />} />
        </Route>
      </Routes>
    </div>
  );
}
