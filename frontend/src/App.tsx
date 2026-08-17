import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { LanguageProvider } from './context/LanguageContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { CitizenLayout } from './components/layout/CitizenLayout';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { CitizenDashboard } from './pages/citizen/CitizenDashboard';
import { ReportProblemPage } from './pages/citizen/ReportProblemPage';
import { ExploreIssuesPage } from './pages/citizen/ExploreIssuesPage';
import { IssueDetailsPage } from './pages/citizen/IssueDetailsPage';
import { MyComplaintsPage } from './pages/citizen/MyComplaintsPage';
import { SupportedIssuesPage } from './pages/citizen/SupportedIssuesPage';
import { TrackingPage } from './pages/citizen/TrackingPage';
import { ProfilePage } from './pages/citizen/ProfilePage';
import { HelpCenterPage } from './pages/citizen/HelpCenterPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Corporation Pages
import { CorporationDashboard } from './pages/corporation/CorporationDashboard';
import { CorporationIssuesPage } from './pages/corporation/CorporationIssuesPage';
import { CorporationIssueDetailPage } from './pages/corporation/CorporationIssueDetailPage';
import { CorporationWorkersPage } from './pages/corporation/CorporationWorkersPage';
import { CorporationAnalyticsPage } from './pages/corporation/CorporationAnalyticsPage';

// Worker Pages
import { WorkerDashboard } from './pages/worker/WorkerDashboard';
import { WorkerTasksPage } from './pages/worker/WorkerTasksPage';

// Common Components
import { AIChatbot } from './components/chatbot/AIChatbot';

export const App: React.FC = () => {
  return (
    <LanguageProvider>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Pages */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />

              {/* Protected Citizen Module Pages */}
              <Route
                path="/citizen"
                element={
                  <ProtectedRoute allowedRoles={['citizen', 'worker', 'corporation']}>
                    <CitizenLayout>
                      <CitizenDashboard />
                    </CitizenLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/citizen/report"
                element={
                  <ProtectedRoute allowedRoles={['citizen', 'worker', 'corporation']}>
                    <CitizenLayout>
                      <ReportProblemPage />
                    </CitizenLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/citizen/issues"
                element={
                  <ProtectedRoute allowedRoles={['citizen', 'worker', 'corporation']}>
                    <CitizenLayout>
                      <ExploreIssuesPage />
                    </CitizenLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/citizen/issues/:id"
                element={
                  <ProtectedRoute allowedRoles={['citizen', 'worker', 'corporation']}>
                    <CitizenLayout>
                      <IssueDetailsPage />
                    </CitizenLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/citizen/complaints"
                element={
                  <ProtectedRoute allowedRoles={['citizen', 'worker', 'corporation']}>
                    <CitizenLayout>
                      <MyComplaintsPage />
                    </CitizenLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/citizen/supported"
                element={
                  <ProtectedRoute allowedRoles={['citizen', 'worker', 'corporation']}>
                    <CitizenLayout>
                      <SupportedIssuesPage />
                    </CitizenLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/citizen/tracking/:issueId"
                element={
                  <ProtectedRoute allowedRoles={['citizen', 'worker', 'corporation']}>
                    <CitizenLayout>
                      <TrackingPage />
                    </CitizenLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/citizen/profile"
                element={
                  <ProtectedRoute allowedRoles={['citizen', 'worker', 'corporation']}>
                    <CitizenLayout>
                      <ProfilePage />
                    </CitizenLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/citizen/help"
                element={
                  <ProtectedRoute allowedRoles={['citizen', 'worker', 'corporation']}>
                    <CitizenLayout>
                      <HelpCenterPage />
                    </CitizenLayout>
                  </ProtectedRoute>
                }
              />

              {/* Corporation Module Pages (Strictly Corporation Only) */}
              <Route
                path="/corporation"
                element={
                  <ProtectedRoute allowedRoles={['corporation']}>
                    <CorporationDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/corporation/issues"
                element={
                  <ProtectedRoute allowedRoles={['corporation']}>
                    <CorporationIssuesPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/corporation/issues/:id"
                element={
                  <ProtectedRoute allowedRoles={['corporation']}>
                    <CorporationIssueDetailPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/corporation/workers"
                element={
                  <ProtectedRoute allowedRoles={['corporation']}>
                    <CorporationWorkersPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/corporation/analytics"
                element={
                  <ProtectedRoute allowedRoles={['corporation']}>
                    <CorporationAnalyticsPage />
                  </ProtectedRoute>
                }
              />

              {/* Worker Module Pages (Worker & Corporation) */}
              <Route
                path="/worker"
                element={
                  <ProtectedRoute allowedRoles={['worker', 'corporation']}>
                    <WorkerDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/worker/tasks"
                element={
                  <ProtectedRoute allowedRoles={['worker', 'corporation']}>
                    <WorkerTasksPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/worker/tasks/:id"
                element={
                  <ProtectedRoute allowedRoles={['worker', 'corporation']}>
                    <WorkerTasksPage />
                  </ProtectedRoute>
                }
              />

              {/* Catch-all 404 Page */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
            <AIChatbot />
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </LanguageProvider>
  );
};

export default App;
