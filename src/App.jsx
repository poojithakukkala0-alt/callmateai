import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import CallCenter from './pages/CallCenter';
import CallerDirectory from './pages/CallerDirectory';
import PriorityAlerts from './pages/PriorityAlerts';
import CallHistory from './pages/CallHistory';
import Settings from './pages/Settings';
import { ProtectedRoute, PublicOnlyRoute } from './components/ProtectedRoute';
import Toast from './components/Toast';

export default function App() {
  return (
    <>
      <Routes>
        {/* Public Landing Page */}
        <Route path="/" element={<Landing />} />

        {/* Public Authentication Pages (redirect to /dashboard if logged in) */}
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <Login />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicOnlyRoute>
              <Register />
            </PublicOnlyRoute>
          }
        />

        {/* Protected Dashboard Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="call-center" element={<CallCenter />} />
          <Route path="callers" element={<CallerDirectory />} />
          <Route path="alerts" element={<PriorityAlerts />} />
          <Route path="history" element={<CallHistory />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Global Floating Toast Notifications */}
      <Toast />
    </>
  );
}
