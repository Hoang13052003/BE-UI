import { message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Đảm bảo đường dẫn này đúng
import { logoutApi } from '../api/authApi';


const Logout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logoutApi();
  
      // // Xử lý phản hồi từ API
      // const responseData = await response.json();
  
      // if (!response.ok) {
      //   throw new Error(responseData.message || "Logout failed.");
      // }
  
      // Nếu logout thành công, xóa token và chuyển hướng về trang đăng nhập
      logout();
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
  
      alert('Đăng xuất thành công!');
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Lỗi trong quá trình đăng xuất:', error);
      message.error('Đã xảy ra lỗi trong quá trình đăng xuất. Vui lòng thử lại sau.');
    }

  };

  

  return (
    handleLogout
  );
};

export default Logout;