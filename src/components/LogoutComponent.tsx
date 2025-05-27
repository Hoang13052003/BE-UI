import { message } from "antd";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext"; // Đảm bảo đường dẫn này đúng
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

      // Nếu logout thành công, xóa token và chuyển hướng về trang đăng nhập
      logout();
      alert("Đăng xuất thành công!");
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Lỗi trong quá trình đăng xuất:", error);
      message.error(
        "Đã xảy ra lỗi trong quá trình đăng xuất. Vui lòng thử lại sau."
      );
    }
  };

  return handleLogout;
};

export default Logout;
