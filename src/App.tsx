import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { AlertProvider } from "./contexts/AlertContext";
import LayoutShare from "./pages/Share/_layout";
import DashboardAdmin from "./pages/Admin/DashboardAdmin";
import AuditLogDashboard from './components/AuditLogDashboard/AuditLogDashboard'; // Đường dẫn đến component của bạn
import { StompProvider, useStompContext } from "./contexts/StompContext";
import React, { useEffect } from "react"; // Import React

// Các import khác giữ nguyên...
import LoginComponent from "./components/LoginComponent";
import ProtectedRoute from "./routes/ProtectedRoute";
import RegisterComponent from "./components/RegisterComponent";
import PublicRoute from "./routes/PublicRouter";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import UserManagement from "./pages/Admin/UserManagement";
import ProjectManager from "./pages/Admin/ProjectManager";
import Notifications from "./pages/Admin/Notifications";
import SystemSettings from "./pages/Admin/SystemSettings";
import DocumentsPage from "./pages/Client/DocumentsPage";
import Messages from "./pages/Client/Messages";
import PageSettings from "./pages/Client/PageSettings";
import HomeIntroSection from "./pages/HomeIntroSection";
import OverviewAdmin from "./pages/Admin/Overview";
import Overview from "./pages/Client/overview";
import ProjectProgressPage from "./pages/Admin/ProjectsUpdate/ProjectUpdatePage";
import ProjectUpdateDetailsPage from "./pages/Admin/ProjectsUpdate/ProjectUpdateDetailsPage";

import AttachmentDisplay from "./pages/Admin/AttachmentManager/AttachmentDisplay";
import ProjectUpdateHistory from "./pages/Admin/AttachmentManager/ProjectUpdateHistory";
import ProjectSnapshotViewer from "./pages/Admin/AttachmentManager/ProjectSnapshotViewer";
import ProjectDetailPage from "./pages/Admin/ProjectDetailPage";

import { NotificationProvider } from "./contexts/NotificationContext";
import EmailVerification from "./pages/auth/EmailVerification";
import Profile from "./pages/Client/Profile";
import Settings from "./pages/Client/Settings";
import { ChatProvider } from "./contexts/ChatContext";
import DashboardClient from "./pages/Client/DashboardClient";

const StompConnectionVisualizer: React.FC = () => {
  const { isConnected, isConnecting, connectionError, connectStomp } = useStompContext();

  let statusMessage = "STOMP: Disconnected";
  let bgColor = "grey";

  if (isConnecting) {
    statusMessage = "STOMP: Connecting...";
    bgColor = "orange";
  } else if (connectionError) {
    statusMessage = `STOMP Error: ${connectionError.message.substring(0, 50)}...`;
    bgColor = "red";
  } else if (isConnected) {
    statusMessage = "STOMP: Connected (Audit Logs)";
    bgColor = "green";
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '10px',
      right: '10px',
      padding: '8px 12px',
      backgroundColor: bgColor,
      color: 'white',
      borderRadius: '4px',
      fontSize: '0.9em',
      zIndex: 10000,
      cursor: connectionError ? 'pointer' : 'default'
    }}
    onClick={connectionError ? () => connectStomp(true) : undefined}
    title={connectionError ? 'Click to retry connection' : statusMessage}
    >
      {statusMessage}
    </div>
  );
};

const AuditLogStompController: React.FC = () => {
  const { userDetails, isAuthenticated } = useAuth();
  const { connectStomp, disconnectStomp, isConnected, isConnecting } = useStompContext();
  const isAdmin = userDetails?.role === "ADMIN";

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      if (!isConnected && !isConnecting) {
        console.log("App: Admin authenticated, connecting STOMP for Audit Logs...");
        connectStomp(true); // Mặc định dùng SockJS
      }
    } else {
      if (isConnected || isConnecting) { // Nếu đang connect hoặc đã connected
        console.log("App: User logged out or not Admin, disconnecting STOMP for Audit Logs...");
        disconnectStomp();
      }
    }
  }, [isAuthenticated, isAdmin, isConnected, isConnecting, connectStomp, disconnectStomp]);

  return null;
};

function App() {
  return (
    <AlertProvider>
      <AuthProvider>
        <ChatProvider>
          <NotificationProvider>
            {/* StompProvider được đặt ở đây để context có sẵn cho AuditLogStompController
                và StompConnectionVisualizer. autoConnect được quản lý bởi AuditLogStompController.
            */}
            <StompProvider autoConnect={false}> {/* autoConnect=false vì Controller sẽ quyết định */}
              <AuditLogStompController />
              <Router>
                <StompConnectionVisualizer /> {/* Hiển thị trạng thái STOMP */}
                <Routes>
                  {/* Public Routes */}
                  <Route element={<PublicRoute />}>
                    <Route path="/" element={<LayoutShare />}>
                      <Route index element={<HomeIntroSection />} />
                      <Route path="reset-password" element={<ResetPasswordPage />} />
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
                        <Route path="project-progress" element={<ProjectProgressPage />} />
                        <Route path="project-updates/:id" element={<ProjectUpdateDetailsPage />} />
                        <Route path="notifications" element={<Notifications />} />
                        <Route path="settings" element={<SystemSettings />} />
                        <Route path="audit-logs" element={<AuditLogDashboard />} />
                        <Route path="projects/:projectId/details" element={<ProjectDetailPage />} />
                        <Route path="projects/:projectId/history" element={<ProjectUpdateHistory />} />
                        <Route path="projects/:projectId/updates/:projectUpdateId/snapshot" element={<ProjectSnapshotViewer />} />
                      </Route>
                      <Route path="/admin/attachment-display/:projectId" element={<AttachmentDisplay />} />
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
                        <Route path="projects/documents" element={<DocumentsPage />} />
                        <Route path="notifications" element={<Notifications />} />
                        <Route path="project-updates/:id" element={<ProjectUpdateDetailsPage />} />
                        <Route path="projects/messages" element={<Messages />} />
                        <Route path="projects/:projectId/details" element={<ProjectDetailPage />} />
                      </Route>
                    </Route>
                  </Route>
                </Routes>
              </Router>
            </StompProvider>
          </NotificationProvider>
        </ChatProvider>
      </AuthProvider>
    </AlertProvider>
  );
}

export default App;
