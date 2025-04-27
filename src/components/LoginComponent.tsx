import React, { useEffect, useState } from 'react';
import LoginForm from '../pages/auth/LoginForm';
import { Spin } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
// import { get } from 'http';
import { getUserInfoApi } from '../api/authApi';

const LoginComponent: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, userRole, login } = useAuth();
  const [loadingUserDetails, setLoadingUserDetails] = useState(false);
  const [userDetailsLoaded, setUserDetailsLoaded] = useState(false); // State để kiểm tra khi nào thông tin người dùng đã được tải

  // Điều hướng khi người dùng đã đăng nhập và có role
  useEffect(() => {
    if (isAuthenticated && userDetailsLoaded) { // Kiểm tra khi nào thông tin người dùng đã được tải
      switch (userRole) {
        case 'ADMIN':
          navigate('/admin/home', { replace: true });
          break;
        case 'USER':
          navigate('/client/home', { replace: true });
          break;
        default:
          navigate('/', { replace: true });
          break;
      }
    }
  }, [isAuthenticated, userRole, userDetailsLoaded, navigate]); // Thêm `userDetailsLoaded` vào dependencies

  // Xử lý login thành công: lấy thông tin user và cập nhật context
  const handleLogin = async () => {
    setLoadingUserDetails(true);
    setUserDetailsLoaded(false); // Đảm bảo là chưa tải thông tin khi bắt đầu

    try {
      const data = await getUserInfoApi();

      const role = data.role;

      if (role) {
        login(role, data); // Cập nhật context
        alert('Đăng nhập thành công!');
        setUserDetailsLoaded(true); // Đánh dấu thông tin người dùng đã được tải
      } else {
        throw new Error('Không xác định được vai trò người dùng.');
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      alert('Không thể lấy thông tin người dùng. Vui lòng thử lại sau.');
      localStorage.removeItem('token');
      navigate('/login');
    } finally {
      setLoadingUserDetails(false);
    }
  };

  return (
    <div className="app">
      {loadingUserDetails ? (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
          }}
        >
          <Spin tip="Đang lấy thông tin người dùng..." />
        </div>
      ) : (
        <LoginForm
          handleLogin={handleLogin}
          handleGoogleLogin={() => { }}
          handleFacebookLogin={() => { }}
        />
      )}
    </div>
  );
};

export default LoginComponent;
