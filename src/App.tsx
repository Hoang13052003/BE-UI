import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginComponent from './components/LoginComponent';
import ProtectedRoute from './routes/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import RegisterComponent from './components/RegisterComponent';
import PublicRoute from './routes/PublicRouter';
import LayoutShare from './pages/Share/_layout';
import DashboardClient from './pages/Client/DashboardClient';
import DashboardAdmin from './pages/Admin/DashboardAdmin';
// import HeroSection from './components/home/HeroSection';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import Dashboard from './pages/Admin/Dashboard';
import UserManagement from './pages/Admin/UserManagement';
import ProjectUpdates from './pages/Admin/ProjectUpdates';
import Notifications from './pages/Admin/Notifications';
import SystemSettings from './pages/Admin/SystemSettings';
import Overview from './pages/Client/overview';
import ProjectDetails from './pages/Client/ProjectDetails';
import DocumentsPage from './pages/Client/DocumentsPage';
import MessagesAndNotes from './pages/Client/MessagesAndNotes';
import ProfileSettings from './pages/Client/ProfileSettings';
import HomeIntroSection from './pages/HomeIntroSection';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route element={<PublicRoute />}>
            <Route path="/" element={<LayoutShare />} >
              <Route index element={<HomeIntroSection />} />
            </Route>
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/register" element={<RegisterComponent />} />
            <Route path="/login" element={<LoginComponent />} />
          </Route>

          {/* Route cho Admin */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path="/" element={<LayoutShare />} >
              <Route path="admin/" element={<DashboardAdmin />} >
                <Route path="overview" element={<Dashboard />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="updates" element={<ProjectUpdates />} />
                <Route path="notifications" element={<Notifications />} />
                <Route path="settings" element={<SystemSettings />} />
              </Route>
            </Route>
          </Route>

          {/* Route cho Client */}
          <Route element={<ProtectedRoute allowedRoles={['USER']} />}>
            <Route path="/" element={<LayoutShare />} >
              <Route path="client/" element={<DashboardClient />} >
                <Route path="overview" element={<Overview />} />
                <Route path="profiles" element={<ProfileSettings />} />
                <Route path="projects/documents" element={<DocumentsPage />} />
                <Route path="projects/messages" element={<MessagesAndNotes />} />
                <Route path="projects/details/:id" element={<ProjectDetails />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;