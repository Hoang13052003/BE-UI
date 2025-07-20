import {
  BrowserRouter as Router,
  Route,
  Routes,
  useNavigate,
  Outlet,
} from "react-router-dom";
import React, { useEffect } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { AlertProvider } from "./contexts/AlertContext";
import LoginComponent from "./components/LoginComponent";
import ProtectedRoute from "./routes/ProtectedRoute";
import RegisterComponent from "./components/RegisterComponent";
import PublicRoute from "./routes/PublicRouter";
import LayoutShare from "./pages/Share/_layout";
import DashboardAdmin from "./pages/Admin/DashboardAdmin";

import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import UserManagement from "./pages/Admin/UserManagement";
import ProjectManager from "./pages/Admin/ProjectManager";
import OverviewAdmin from "./pages/Admin/Overview";

import AttachmentDisplay from "./pages/Admin/AttachmentManager/AttachmentDisplay";
import ProjectUpdateHistory from "./pages/Admin/AttachmentManager/ProjectUpdateHistory";
import ProjectSnapshotViewer from "./pages/Admin/AttachmentManager/ProjectSnapshotViewer";

import { NotificationProvider } from "./contexts/NotificationContext";
import { ChatProvider } from "./contexts/ChatContext";
import EmailVerification from "./pages/auth/EmailVerification";
import Profile from "./pages/Client/Profile";
import Settings from "./pages/Client/Settings";
import Feedbacks from "./pages/Admin/Feedbacks";
import AuthLogMonitor from "./pages/Admin/AuditLogDashboard/AuthLogMonitor";
import ProjectUpdatesForClientPage from "./pages/Client/ProjectUpdatesForClientPage";
import LandingPage from "./pages/LandingPage";
import AlertContainer from "./components/AlertContainer";
import DashboardManager from "./pages/Manager/DashboardManager";
import OverviewManager from "./pages/Manager/OverviewManager";
import PageSettingsManager from "./pages/Manager/PageSettingsManager";
import MyFeedbacksManager from "./pages/Manager/MyFeedbacksManager";
import ProjectProgressListManager from "./pages/Manager/ProjectProgressListManager";
import NotificationsManager from "./pages/Manager/NotificationsManager";
import ProjectUpdateDetailsPageManager from "./pages/Manager/ProjectUpdateDetailsPageManager";
import ProjectDetailPageManager from "./pages/Manager/ProjectDetailPageManager";
import OvertimeRequestPageAdmin from "./pages/Admin/OvertimeRequestPageAdmin";
import OvertimeRequestPageManager from "./pages/Manager/OvertimeRequestPageManager";
import DashboardClient from "./pages/Client/DashboardClient";
import OverviewClient from "./pages/Client/OverviewClient";
import ChatPage from "./pages/Chat/ChatPage";

const AuthEventHandler: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthLogout = () => {
      console.warn("Auth logout event received, redirecting to login");
      navigate("/login", { replace: true });
    };

    window.addEventListener("auth:logout", handleAuthLogout);

    return () => {
      window.removeEventListener("auth:logout", handleAuthLogout);
    };
  }, [navigate]);

  return null;
};

function App() {
  return (
    <AlertProvider>
      <AuthProvider>
        <NotificationProvider>
          <Router
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true
            }}
          >
            <AlertContainer />
            <AuthEventHandler />
            <Routes>
            {/* Public Routes */}
            <Route element={<PublicRoute />}>
              <Route path="/" element={<LayoutShare />}>
                <Route index element={<LandingPage />} />
                <Route
                  path="reset-password"
                  element={<ResetPasswordPage />}
                />
                <Route path="register" element={<RegisterComponent />} />
                <Route path="login" element={<LoginComponent />} />
                <Route path="verify-email" element={<EmailVerification />} />
              </Route>
            </Route>

            {/* Protected Routes - All wrapped with ChatProvider */}
            <Route element={<ProtectedRoute allowedRoles={["ADMIN", "MANAGER", "USER"]} />}>
              <Route element={<ChatProviderWrapper />}>
                {/* Route for Admin */}
            <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
              <Route path="/" element={<LayoutShare />}>
                <Route path="admin/" element={<DashboardAdmin />}>
                  <Route path="overview" element={<OverviewAdmin />} />
                  <Route path="users" element={<UserManagement />} />
                  <Route path="updates" element={<ProjectManager />} />
                  <Route
                    path="project-progress"
                    element={<ProjectProgressListManager />}
                  />
                  <Route
                    path="project-updates/:id"
                    element={<ProjectUpdateDetailsPageManager />}
                  />
                  <Route
                    path="notifications"
                    element={<NotificationsManager />}
                  />
                  <Route path="settings" element={<PageSettingsManager />}>
                        <Route index element={<Settings />} />
                    <Route path="profile" element={<Profile />} />
                  </Route>
                  <Route
                    path="projects/fixed-price/:projectId/details"
                    element={<ProjectDetailPageManager />}
                      /> 
                  <Route
                    path="projects/labor/:projectId/details"
                    element={<ProjectDetailPageManager />}
                  />
                  <Route path="feedbacks" element={<Feedbacks />} />
                  <Route path="audit-logs" element={<AuthLogMonitor />} />
                  <Route
                    path="overtime-requests"
                    element={<OvertimeRequestPageAdmin />}
                  />
                  <Route
                    path="projects/:projectType/:projectId/history"
                    element={<ProjectUpdateHistory />}
                  />
                  <Route
                    path="projects/:projectType/:projectId/updates/:projectUpdateId/snapshot"
                    element={<ProjectSnapshotViewer />}
                  />
                  <Route
                    path="attachment-display/:projectType/:projectId"
                    element={<AttachmentDisplay />}
                  />
                  <Route path="chat" element={<ChatPage />} />
                </Route>
              </Route>
            </Route>

                {/* Route for Client */}
            <Route element={<ProtectedRoute allowedRoles={["USER"]} />}>
              <Route path="/" element={<LayoutShare />}>
                <Route path="client/" element={<DashboardClient />}>
                  <Route path="overview" element={<OverviewClient />} />
                  <Route
                    path="project-updates"
                    element={<ProjectUpdatesForClientPage />}
                  />
                  <Route
                    path="project-updates/:id"
                    element={<ProjectUpdateDetailsPageManager />}
                  />
                  <Route
                    path="my-feedbacks"
                    element={<MyFeedbacksManager />}
                  />
                  <Route
                    path="notifications"
                    element={<NotificationsManager />}
                  />
                  <Route path="chat" element={<ChatPage />} />
                  <Route path="settings" element={<PageSettingsManager />}>
                    <Route index element={<Settings />} />
                    <Route path="profile" element={<Profile />} />
                  </Route>
                  <Route
                    path="projects/fixed-price/:projectId/details"
                    element={<ProjectDetailPageManager />}
                  />
                  <Route
                    path="projects/labor/:projectId/details"
                    element={<ProjectDetailPageManager />}
                  />
                </Route>
              </Route>
            </Route>

                {/* Route for Manager */}
            <Route element={<ProtectedRoute allowedRoles={["MANAGER"]} />}>
              <Route path="/" element={<LayoutShare />}>
                <Route path="manager/" element={<DashboardManager />}>
                  <Route path="overview" element={<OverviewManager />} />
                  <Route path="settings" element={<PageSettingsManager />}>
                    <Route index element={<Settings />} />
                    <Route path="profile" element={<Profile />} />
                  </Route>
                  <Route
                    path="notifications"
                    element={<NotificationsManager />}
                  />
                  <Route
                    path="project-updates/:id"
                    element={<ProjectUpdateDetailsPageManager />}
                  />
                  <Route
                    path="my-feedbacks"
                    element={<MyFeedbacksManager />}
                  />
                  <Route
                    path="project-progress"
                    element={<ProjectProgressListManager />}
                  />
                  <Route
                    path="overtime-requests"
                    element={<OvertimeRequestPageManager />}
                  />
                  <Route path="chat" element={<ChatPage />} />
                  <Route
                    path="projects/fixed-price/:projectId/details"
                    element={<ProjectDetailPageManager />}
                  />
                  <Route
                    path="projects/labor/:projectId/details"
                    element={<ProjectDetailPageManager />}
                  />
                  <Route
                    path="projects/:projectType/:projectId/history"
                    element={<ProjectUpdateHistory />}
                  />
                  <Route
                    path="projects/:projectType/:projectId/updates/:projectUpdateId/snapshot"
                    element={<ProjectSnapshotViewer />}
                  />
                  <Route
                    path="attachment-display/:projectType/:projectId"
                    element={<AttachmentDisplay />}
                  />
                    </Route>
                  </Route>
                </Route>
              </Route>
            </Route>
            </Routes>
          </Router>
        </NotificationProvider>
      </AuthProvider>
    </AlertProvider>
  );
}

// Wrapper component to provide ChatProvider only for authenticated routes
const ChatProviderWrapper = () => {
  return (
    <ChatProvider>
      <Outlet />
    </ChatProvider>
  );
};

export default App;
