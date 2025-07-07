import {
  BrowserRouter as Router,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";
import React, { useEffect } from "react";
import { AuthProvider } from "./contexts/AuthContext";
import { AlertProvider } from "./contexts/AlertContext";
import LoginComponent from "./components/LoginComponent";
import ProtectedRoute from "./routes/ProtectedRoute";
import RegisterComponent from "./components/RegisterComponent";
import PublicRoute from "./routes/PublicRouter";
import LayoutShare from "./pages/Share/_layout";
import DashboardClient from "./pages/Client/DashboardClient";
import DashboardAdmin from "./pages/Admin/DashboardAdmin";

import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import UserManagement from "./pages/Admin/UserManagement";
import ProjectManager from "./pages/Admin/ProjectManager";
import Notifications from "./pages/Admin/Notifications";
import PageSettings from "./pages/Client/PageSettings";
import OverviewAdmin from "./pages/Admin/Overview";
import Overview from "./pages/Client/overview";
import ProjectUpdateDetailsPage from "./pages/Admin/ProjectsUpdate/ProjectUpdateDetailsPage";

import AttachmentDisplay from "./pages/Admin/AttachmentManager/AttachmentDisplay";
import ProjectUpdateHistory from "./pages/Admin/AttachmentManager/ProjectUpdateHistory";
import ProjectSnapshotViewer from "./pages/Admin/AttachmentManager/ProjectSnapshotViewer";
import ProjectDetailPage from "./pages/Admin/ProjectDetailPage";

import { NotificationProvider } from "./contexts/NotificationContext";
import EmailVerification from "./pages/auth/EmailVerification";
import Profile from "./pages/Client/Profile";
import Settings from "./pages/Client/Settings";
import Feedbacks from "./pages/Admin/Feedbacks";
// import { ChatProvider } from "./contexts/ChatContext";
import MyFeedbacks from "./pages/Client/MyFeedbacks";
import AuthLogMonitor from "./pages/Admin/AuditLogDashboard/AuthLogMonitor";
import ProjectUpdatesForClientPage from "./pages/Client/ProjectUpdatesForClientPage";
import LandingPage from "./pages/LandingPage";
import AlertContainer from "./components/AlertContainer";
import ProjectProgressList from "./pages/Admin/ProjectsUpdate/ProjectProgressList";

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
        {/* <ChatProvider> */}
        <NotificationProvider>
          <Router>
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

              {/* Route cho Admin */}
              <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
                <Route path="/" element={<LayoutShare />}>
                  <Route path="admin/" element={<DashboardAdmin />}>
                    <Route path="overview" element={<OverviewAdmin />} />
                    <Route path="users" element={<UserManagement />} />
                    <Route path="updates" element={<ProjectManager />} />
                    <Route
                      path="project-progress"
                      element={<ProjectProgressList />}
                    />
                    <Route
                      path="project-updates/:id"
                      element={<ProjectUpdateDetailsPage />}
                    />
                    <Route path="notifications" element={<Notifications />} />
                    {/* <Route path="messages" element={<Messages />} /> */}
                    <Route path="settings" element={<PageSettings />}>
                      <Route index element={<Settings />} />{" "}
                      {/* Route mặc định ("/settings") */}
                      <Route path="profile" element={<Profile />} />
                    </Route>
                    <Route
                      path="projects/fixed-price/:projectId/details"
                      element={<ProjectDetailPage />}
                    />{" "}
                    <Route
                      path="projects/labor/:projectId/details"
                      element={<ProjectDetailPage />}
                    />
                    <Route path="feedbacks" element={<Feedbacks />} />
                    <Route path="audit-logs" element={<AuthLogMonitor />} />
                    <Route
                      path="projects/:projectId/history"
                      element={<ProjectUpdateHistory />}
                    />
                    <Route
                      path="projects/:projectId/updates/:projectUpdateId/snapshot"
                      element={<ProjectSnapshotViewer />}
                    />
                    <Route
                      path="attachment-display/:projectId"
                      element={<AttachmentDisplay />}
                    />
                  </Route>
                </Route>
              </Route>

              {/* Route cho Client */}
              <Route element={<ProtectedRoute allowedRoles={["USER"]} />}>
                <Route path="/" element={<LayoutShare />}>
                  <Route path="client/" element={<DashboardClient />}>
                    <Route path="overview" element={<Overview />} />
                    <Route path="settings" element={<PageSettings />}>
                      <Route index element={<Settings />} />
                      <Route path="profile" element={<Profile />} />
                    </Route>
                    <Route path="notifications" element={<Notifications />} />
                    <Route
                      path="project-updates/:id"
                      element={<ProjectUpdateDetailsPage />}
                    />
                    <Route path="my-feedbacks" element={<MyFeedbacks />} />
                    <Route
                      path="project-updates"
                      element={<ProjectUpdatesForClientPage />}
                    />
                    {/* <Route path="messages" element={<Messages />} /> */}
                    <Route
                      path="projects/fixed-price/:projectId/details"
                      element={<ProjectDetailPage />}
                    />
                    <Route
                      path="projects/labor/:projectId/details"
                      element={<ProjectDetailPage />}
                    />
                  </Route>
                </Route>
              </Route>

              <Route element={<ProtectedRoute allowedRoles={["MANAGER"]} />}>
                <Route path="/" element={<LayoutShare />}>
                  <Route path="manager/" element={<DashboardClient />}>
                    <Route path="overview" element={<Overview />} />
                    <Route path="settings" element={<PageSettings />}>
                      <Route index element={<Settings />} />
                      <Route path="profile" element={<Profile />} />
                    </Route>
                    <Route path="notifications" element={<Notifications />} />
                    <Route
                      path="project-updates/:id"
                      element={<ProjectUpdateDetailsPage />}
                    />
                    <Route path="my-feedbacks" element={<MyFeedbacks />} />
                    <Route
                      path="project-progress"
                      element={<ProjectProgressList />}
                    />
                    {/* <Route path="messages" element={<Messages />} /> */}
                    <Route
                      path="projects/fixed-price/:projectId/details"
                      element={<ProjectDetailPage />}
                    />
                    <Route
                      path="projects/labor/:projectId/details"
                      element={<ProjectDetailPage />}
                    />
                  </Route>
                </Route>
              </Route>
            </Routes>
          </Router>
        </NotificationProvider>
        {/* </ChatProvider> */}
      </AuthProvider>
    </AlertProvider>
  );
}

export default App;
