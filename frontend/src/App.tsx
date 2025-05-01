import React, { Suspense } from "react"; // import Suspense
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "@/contexts/AppContext";
import ProtectedRoute from "@/components/ProtectedRoute";

// Lazy load components
const Landing = React.lazy(() => import("@/pages/Landing"));
const AuthFlow = React.lazy(() => import("@/pages/AuthFlow.tsx"));
const Dashboard = React.lazy(() => import("@/pages/Dashboard"));
const SendMoney = React.lazy(() => import("@/pages/SendMoney"));
const Transactions = React.lazy(() => import("@/pages/Transactions"));
const Profile = React.lazy(() => import("@/pages/Profile"));
const LinkAccount = React.lazy(() => import("@/pages/LinkAccount"));
const NotFound = React.lazy(() => import("@/pages/NotFound"));
const Accounts = React.lazy(() => import("@/pages/Accounts.tsx"));

const queryClient = new QueryClient();

const App = () => (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <AppProvider>
            <Toaster />
            <Sonner />
            <Suspense fallback={<div>Loading...</div>}> {/* Fallback UI while loading */}
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<AuthFlow />} />
                <Route path="/register" element={<AuthFlow />} />

                {/* Protected Routes */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/send-money" element={
                  <ProtectedRoute>
                    <SendMoney />
                  </ProtectedRoute>
                } />
                <Route path="/transactions" element={
                  <ProtectedRoute>
                    <Transactions />
                  </ProtectedRoute>
                } />
                <Route path="/accounts" element={
                  <ProtectedRoute>
                    <Accounts />
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
                <Route path="/link-account" element={
                  <ProtectedRoute>
                    <LinkAccount />
                  </ProtectedRoute>
                } />

                {/* Not Found */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </AppProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
);

export default App;
