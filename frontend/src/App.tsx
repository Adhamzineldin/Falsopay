import React, { Suspense, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider, useApp } from "@/contexts/AppContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import LoadingSpinner from "@/components/LoadingSpinner";
import MaintenanceScreen from "@/components/MaintenanceScreen";
import SystemStatusMonitor from "@/components/SystemStatusMonitor";

// Lazy load all pages
const Landing = React.lazy(() => import("@/pages/Landing"));
const AuthFlow = React.lazy(() => import("@/pages/AuthFlow"));
const Dashboard = React.lazy(() => import("@/pages/Dashboard"));
const SendMoney = React.lazy(() => import("@/pages/SendMoney"));
const Transactions = React.lazy(() => import("@/pages/Transactions"));
const MoneyRequests = React.lazy(() => import("@/pages/MoneyRequests"));
const Profile = React.lazy(() => import("@/pages/Profile"));
const LinkAccount = React.lazy(() => import("@/pages/LinkAccount"));
const NotFound = React.lazy(() => import("@/pages/NotFound"));
const Accounts = React.lazy(() => import("@/pages/Accounts"));
const Support = React.lazy(() => import("@/pages/Support"));
const AdminDashboard = React.lazy(() => import("@/pages/admin/AdminDashboard"));
const ManageFavorites = React.lazy(() => import("@/pages/ManageFavorites"));

const queryClient = new QueryClient();

// Wrapper component that handles the maintenance mode check
const AppContent = () => {
  const { maintenance, checkMaintenanceStatus, isLoading } = useApp();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (maintenance.isInMaintenance) {
    return (
      <MaintenanceScreen 
        message={maintenance.message}
        onRetry={checkMaintenanceStatus}
        isRetrying={maintenance.isChecking}
      />
    );
  }

  return (
    <>
      <SystemStatusMonitor checkInterval={30000} />
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<AuthFlow />} />
          <Route path="/register" element={<AuthFlow />} />

          {/* Protected Routes */}
          <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
          />
          <Route
              path="/send-money"
              element={
                <ProtectedRoute>
                  <SendMoney />
                </ProtectedRoute>
              }
          />
          <Route
              path="/transactions"
              element={
                <ProtectedRoute>
                  <Transactions />
                </ProtectedRoute>
              }
          />
          <Route
              path="/money-requests"
              element={
                <ProtectedRoute>
                  <MoneyRequests />
                </ProtectedRoute>
              }
          />
          <Route
              path="/accounts"
              element={
                <ProtectedRoute>
                  <Accounts />
                </ProtectedRoute>
              }
          />
          <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
          />
          <Route
              path="/link-account"
              element={
                <ProtectedRoute>
                  <LinkAccount />
                </ProtectedRoute>
              }
          />
          <Route
              path="/support"
              element={
                <ProtectedRoute>
                  <Support />
                </ProtectedRoute>
              }
          />
          <Route
              path="/support/ticket/:ticketId"
              element={
                <ProtectedRoute>
                  <Support />
                </ProtectedRoute>
              }
          />
          <Route
              path="/admin"
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
          />
          <Route
              path="/manage-favorites"
              element={
                <ProtectedRoute>
                  <ManageFavorites />
                </ProtectedRoute>
              }
          />

          {/* Not Found */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  );
};

const App = () => {
  useEffect(() => {
    if ("requestIdleCallback" in window) {
      // Preload AuthFlow first during idle
      requestIdleCallback(() => {
        import("@/pages/AuthFlow").then(() => {
          // After AuthFlow is prefetched, load others
          requestIdleCallback(() => {
            import("@/pages/Dashboard");
            import("@/pages/SendMoney");
            import("@/pages/Transactions");
            import("@/pages/MoneyRequests");
            import("@/pages/Profile");
            import("@/pages/LinkAccount");
            import("@/pages/NotFound");
            import("@/pages/Accounts");
            import("@/pages/Landing");
            import("@/pages/Support");
            import("@/pages/admin/AdminDashboard");
            import("@/pages/ManageFavorites");
          });
        });
      });
    }
  }, []);

  return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <BrowserRouter>
            <AppProvider>
              <Toaster />
              <Sonner />
              <AppContent />
            </AppProvider>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
  );
};

export default App;
