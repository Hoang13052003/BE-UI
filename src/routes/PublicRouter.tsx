import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const PublicRoute = () => {
  const { userRole } = useAuth();

  if (userRole) {
    if (userRole === "ADMIN") return <Navigate to="/admin/overview" replace />;
    if (userRole === "USER") return <Navigate to="/client/overview" replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
