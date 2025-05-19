import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const PublicRoute = () => {
  const { userRole } = useAuth();

  // Nếu đã đăng nhập thì redirect về home tùy theo role
  if (userRole) {
    if (userRole === "ADMIN") return <Navigate to="/admin/overview" replace />;
    if (userRole === "USER") return <Navigate to="/client/overview" replace />;
  }

  return <Outlet />; // Cho phép truy cập nếu chưa đăng nhập
};

export default PublicRoute;
