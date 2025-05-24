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
import ProjectUpdates from "./pages/Admin/ProjectUpdates";
import Notifications from "./pages/Admin/Notifications";
import SystemSettings from "./pages/Admin/SystemSettings";
import ProjectDetails from "./pages/Client/ProjectDetails";
import DocumentsPage from "./pages/Client/DocumentsPage";
import MessagesAndNotes from "./pages/Client/MessagesAndNotes";
import ProfileSettings from "./pages/Client/ProfileSettings";
import HomeIntroSection from "./pages/HomeIntroSection";
import OverviewAdmin from "./pages/Admin/Overview";
import Overview from "./pages/Client/Overview";
import { AlertProvider } from "./contexts/AlertContext";
import AlertContainer from "./components/AlertContainer";
import ProjectProgressPage from "./pages/Admin/ProjectsUpdate/ProjectUpdatePage";
import ProjectUpdateDetailsPage from "./pages/Admin/ProjectsUpdate/ProjectUpdateDetailsPage";
import { NotificationProvider } from "./contexts/NotificationContext";
import AttachmentDisplay from "./pages/Admin/AttachmentManager/AttachmentDisplay"; // Component chứa ProjectFileExplorer (Component A)
import ProjectUpdateHistory from "./pages/Admin/AttachmentManager/ProjectUpdateHistory"; // Component B (vừa tạo)
import ProjectSnapshotViewer from "./pages/Admin/AttachmentManager/ProjectSnapshotViewer"; // Component C (sẽ tạo ở bước sau)

function App() {
  return (
    <AlertProvider>
      <AuthProvider>
        <NotificationProvider>
          <Router>
            <Routes>
              <Route element={<PublicRoute />}>
                <Route path="/" element={<LayoutShare />}>
                  <Route index element={<HomeIntroSection />} />
                </Route>
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/register" element={<RegisterComponent />} />
                <Route path="/login" element={<LoginComponent />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
                <Route path="/" element={<LayoutShare />}>
                  <Route path="admin/" element={<DashboardAdmin />}>
                    <Route path="overview" element={<OverviewAdmin />} />
                    <Route path="users" element={<UserManagement />} />
                    <Route path="updates" element={<ProjectUpdates />} />
                    <Route
                      path="project-progress"
                      element={<ProjectProgressPage />}
                    />
                    <Route
                      path="project-updates/:id"
                      element={<ProjectUpdateDetailsPage />}
                    />
                    <Route path="notifications" element={<Notifications />} />
                    <Route path="settings" element={<SystemSettings />} />
                  </Route>
                  <Route
                    path="/admin/attachment-display/:projectId"
                    element={<AttachmentDisplay />}
                  />
                  <Route
                    path="projects/:projectId/history"
                    element={<ProjectUpdateHistory />}
                  />
                  <Route
                    path="projects/:projectId/updates/:projectUpdateId/snapshot"
                    element={<ProjectSnapshotViewer />}
                  />{" "}
                  {/* <<--- ROUTE CHO COMPONENT C */}
                </Route>
              </Route>

              {/* Route cho Client */}
              <Route element={<ProtectedRoute allowedRoles={["USER"]} />}>
                <Route path="/" element={<LayoutShare />}>
                  <Route path="client/" element={<DashboardClient />}>
                    <Route path="overview" element={<Overview />} />
                    <Route path="profiles" element={<ProfileSettings />} />
                    <Route
                      path="projects/documents"
                      element={<DocumentsPage />}
                    />
                    <Route
                      path="projects/messages"
                      element={<MessagesAndNotes />}
                    />
                    <Route
                      path="projects/details/:id"
                      element={<ProjectDetails />}
                    />
                  </Route>
                </Route>
              </Route>
            </Routes>
          </Router>
          <AlertContainer /> {/* Đặt ở ngoài cùng, sau Router */}
        </NotificationProvider>
      </AuthProvider>
    </AlertProvider>
  );
}

export default App;
