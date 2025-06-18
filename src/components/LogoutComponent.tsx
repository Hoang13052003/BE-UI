import { message } from "antd";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { logoutApi } from "../api/authApi";

const Logout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found");
      }

      await logoutApi(token);

      logout();
      alert("Logout successful!");
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Error during logout:", error);
      message.error("An error occurred during logout. Please try again later.");
    }
  };

  return handleLogout;
};

export default Logout;
