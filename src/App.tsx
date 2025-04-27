import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginComponent from './components/LoginComponent';
import Home from './pages/welcome';
import ProtectedRoute from './routes/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import RegisterComponent from './components/RegisterComponent';
import PublicRoute from './routes/PublicRouter';
import LayoutShare from './pages/Share/_layout';
import DashboardClient from './pages/Client/DashboardClient';
import DashboardAdmin from './pages/Admin/DashboardAdmin';
import HeroSection from './components/home/HeroSection';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route element={<PublicRoute />}>
            <Route path="/" element={<LayoutShare />} >
              <Route index element={<HeroSection />} />
            </Route>
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/register" element={<RegisterComponent />} />
            <Route path="/login" element={<LoginComponent />} />
          </Route>

          {/* Route cho Admin */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path="/" element={<LayoutShare />} >
              <Route path="admin/" element={<DashboardAdmin />} >
                <Route path="home" element={<Home />} />
              </Route>
            </Route>
          </Route>

          {/* Route cho Client */}
          <Route element={<ProtectedRoute allowedRoles={['USER']} />}>
            <Route path="/" element={<LayoutShare />} >
              <Route path="client/" element={<DashboardClient />} >
                <Route path="home" element={<Home />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;