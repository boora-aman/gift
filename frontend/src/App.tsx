import '@/lib/i18n'
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { MainLayout } from "./components/layout";
import { RequireAuth } from "./components/auth/RequireAuth";
import { RequireRole } from "./components/auth/RequireRole";
import { RoleProvider } from "./contexts/RoleContext";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import { GiftList, GiftForm, GiftDetail } from "./pages/gifts";
import CategoryList from "./pages/categories/CategoryList";
import RecipientList from "./pages/recipients/RecipientList";
import { IssueList, IssueForm } from "./pages/issues";
import { InterestList, InterestForm } from "./pages/interests";
import { ReceiptList, ReceiptForm } from "./pages/receipts";
import { EventList, EventForm } from "./pages/events";
import { MaintenanceList, MaintenanceForm } from "./pages/maintenance";
import { DispatchList, DispatchForm } from "./pages/dispatch";
import { ReportList, ReportViewer } from "./pages/reports";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Notifications from "./pages/Notifications";
import NotFound from "./pages/NotFound";
import ConnectionDebug from "./pages/debug/ConnectionDebug";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<RequireAuth />}>
            <Route element={<RoleProvider><MainLayout /></RoleProvider>}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/gifts" element={<GiftList />} />
              <Route path="/gifts/new" element={<GiftForm mode="create" />} />
              <Route path="/gifts/:id" element={<GiftDetail />} />
              <Route path="/gifts/:id/edit" element={<GiftForm mode="edit" />} />
              
              {/* Categories - Admin only */}
              <Route path="/categories" element={
                <RequireRole permission="canAccessCategories">
                  <CategoryList />
                </RequireRole>
              } />
              
              <Route path="/recipients" element={<RecipientList />} />
              
              {/* Issues */}
              <Route path="/issues" element={<IssueList />} />
              <Route path="/issues/new" element={<IssueForm />} />
              <Route path="/issues/:id" element={<IssueForm />} />
              
              {/* Interests */}
              <Route path="/interests" element={<InterestList />} />
              <Route path="/interests/new" element={<InterestForm />} />
              <Route path="/interests/:id" element={<InterestForm />} />
              
              {/* Events */}
              <Route path="/events" element={<EventList />} />
              <Route path="/events/new" element={<EventForm />} />
              <Route path="/events/:id" element={<EventForm />} />
              
              {/* Receipts */}
              <Route path="/receipts" element={<ReceiptList />} />
              <Route path="/receipts/new" element={<ReceiptForm />} />
              <Route path="/receipts/:id" element={<ReceiptForm />} />
              
              {/* Maintenance - Admin only */}
              <Route path="/maintenance" element={
                <RequireRole permission="canAccessMaintenance">
                  <MaintenanceList />
                </RequireRole>
              } />
              <Route path="/maintenance/new" element={
                <RequireRole permission="canAccessMaintenance">
                  <MaintenanceForm />
                </RequireRole>
              } />
              <Route path="/maintenance/:id" element={
                <RequireRole permission="canAccessMaintenance">
                  <MaintenanceForm />
                </RequireRole>
              } />
              
              {/* Dispatch */}
              <Route path="/dispatch" element={<DispatchList />} />
              <Route path="/dispatch/new" element={<DispatchForm />} />
              <Route path="/dispatch/:id" element={<DispatchForm />} />
              
              {/* Reports - Admin only */}
              <Route path="/reports" element={
                <RequireRole permission="canAccessReports">
                  <ReportList />
                </RequireRole>
              } />
              <Route path="/reports/:reportId" element={
                <RequireRole permission="canAccessReports">
                  <ReportViewer />
                </RequireRole>
              } />
              
              {/* Profile, Settings & Notifications */}
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/notifications" element={<Notifications />} />
            </Route>
          </Route>

          <Route path="/debug/connection" element={<ConnectionDebug />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
