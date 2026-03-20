import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppLayout      from './components/layout/AppLayout';
import Login          from './pages/auth/Login';
import Register       from './pages/auth/Register';
import Dashboard      from './pages/Dashboard';
import Parties        from './pages/parties/Parties';
import PartyDetail    from './pages/parties/PartyDetail';
import AddParty       from './pages/parties/AddParty';
import AddTransaction from './pages/parties/AddTransaction';
import StaffList      from './pages/staff/StaffList';
import StaffDetail    from './pages/staff/StaffDetail';
import AddStaff       from './pages/staff/AddStaff';
import Calculator     from './pages/Calculator';
import Reports        from './pages/Reports';
import Profile        from './pages/Profile';
import ChatBot        from './components/ChatBot';
import './App.css';

function Private({ children }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" replace />;
}
function Public({ children }) {
  const { token } = useAuth();
  return !token ? children : <Navigate to="/" replace />;
}
function BotWrapper() {
  const { token } = useAuth();
  return token ? <ChatBot /> : null;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-center" toastOptions={{
          duration: 2800,
          style: { borderRadius:'12px', fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:'14px', fontWeight:'600', maxWidth:'340px' },
          success: { iconTheme: { primary:'#1a9e5c', secondary:'#fff' } },
          error:   { iconTheme: { primary:'#e53935', secondary:'#fff' } }
        }} />
        <Routes>
          <Route path="/login"    element={<Public><Login /></Public>} />
          <Route path="/register" element={<Public><Register /></Public>} />
          <Route path="/" element={<Private><AppLayout /></Private>}>
            <Route index                          element={<Dashboard />} />
            <Route path="customers"               element={<Parties type="customer" />} />
            <Route path="suppliers"               element={<Parties type="supplier" />} />
            <Route path="parties/add/:type"       element={<AddParty />} />
            <Route path="parties/:id"             element={<PartyDetail />} />
            <Route path="parties/:id/transaction" element={<AddTransaction />} />
            <Route path="staff"                   element={<StaffList />} />
            <Route path="staff/add"               element={<AddStaff />} />
            <Route path="staff/:id"               element={<StaffDetail />} />
            <Route path="calculator"              element={<Calculator />} />
            <Route path="reports"                 element={<Reports />} />
            <Route path="profile"                 element={<Profile />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <BotWrapper />
      </BrowserRouter>
    </AuthProvider>
  );
}
