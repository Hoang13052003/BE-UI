import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LoginComponent from "./components/LoginComponent";
import ProtectedRoute from "./routes/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";
import RegisterComponent from "./components/RegisterComponent";
import PublicRoute from "./routes/PublicRouter";
import LayoutShare from "./pages/Share/_layout";
import DashboardClient from "./pages/Client/DashboardClient";
import DashboardAdmin from "./pages/Admin/DashboardAdmin";
// import HeroSection from './components/home/HeroSection';
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
import { AlertProvider } from "./contexts/AlertContext";
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
import Feedbacks from "./pages/Admin/Feedbacks";
import { ChatProvider } from "./contexts/ChatContext";

function App() {
  return (
    <AlertProvider>
      <AuthProvider>
        <ChatProvider>
          <NotificationProvider>
            <Router>
              <Routes>
                <Route element={<PublicRoute />}>
                  <Route path="/" element={<LayoutShare />}>
                    <Route index element={<HomeIntroSection />} />
                    <Route
                      path="reset-password"
                      element={<ResetPasswordPage />}
                    />
                    <Route path="register" element={<RegisterComponent />} />
                    <Route path="login" element={<LoginComponent />} />
                    <Route
                      path="verify-email"
                      element={<EmailVerification />}
                    />
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
                        element={<ProjectProgressPage />}
                      />
                      <Route
                        path="project-updates/:id"
                        element={<ProjectUpdateDetailsPage />}
                      />
                      <Route path="notifications" element={<Notifications />} />

                      <Route path="settings" element={<PageSettings />}>
                        <Route index element={<Settings />} />{" "}
                        {/* Route mặc định ("/settings") */}
                        <Route path="profile" element={<Profile />} />
                      </Route>

                      <Route
                        path="projects/:projectId/details"
                        element={<ProjectDetailPage />}
                      />
                      <Route path="feedbacks" element={<Feedbacks />} />
                      <Route
                        path="projects/:projectId/history"
                        element={<ProjectUpdateHistory />}
                      />
                      <Route
                        path="projects/:projectId/updates/:projectUpdateId/snapshot"
                        element={<ProjectSnapshotViewer />}
                      />
                    </Route>
                    <Route
                      path="/admin/attachment-display/:projectId"
                      element={<AttachmentDisplay />}
                    />
                  </Route>
                </Route>

                {/* Route cho Client */}
                <Route element={<ProtectedRoute allowedRoles={["USER"]} />}>
                  <Route path="/" element={<LayoutShare />}>
                    <Route path="client/" element={<DashboardClient />}>
                      <Route path="overview" element={<Overview />} />
                      <Route path="settings" element={<PageSettings />}>
                        <Route index element={<Settings />} />{" "}
                        {/* Route mặc định ("/settings") */}
                        <Route path="profile" element={<Profile />} />
                      </Route>
                      <Route
                        path="projects/documents"
                        element={<DocumentsPage />}
                      />
                      <Route path="notifications" element={<Notifications />} />
                      <Route
                        path="project-updates/:id"
                        element={<ProjectUpdateDetailsPage />}
                      />
                      <Route path="projects/messages" element={<Messages />} />
                      <Route
                        path="projects/:projectId/details"
                        element={<ProjectDetailPage />}
                      />
                    </Route>
                  </Route>
                </Route>
              </Routes>
            </Router>
          </NotificationProvider>
        </ChatProvider>
      </AuthProvider>
    </AlertProvider>
  );
}

export default App;
