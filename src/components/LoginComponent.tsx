import React, { useEffect, useState } from "react";
import LoginForm from "../pages/auth/LoginForm";
import { Spin } from "antd";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { getUserInfoApi, LoginResponse } from "../api/authApi";

const LoginComponent: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, userRole, login } = useAuth();
  const [loadingUserDetails, setLoadingUserDetails] = useState(false);
  const [userDetailsLoaded, setUserDetailsLoaded] = useState(false);

  useEffect(() => {
    if (isAuthenticated && userDetailsLoaded) {
      switch (userRole) {
        case "ADMIN":
          navigate("/admin/overview", { replace: true });
          break;
        case "USER":
          navigate("/client/home", { replace: true });
          break;
        default:
          navigate("/", { replace: true });
          break;
      }
    }
  }, [isAuthenticated, userRole, userDetailsLoaded, navigate]);

  const handleLogin = async (data: LoginResponse) => {
    setLoadingUserDetails(true);
    setUserDetailsLoaded(false);
    try {
      const user = await getUserInfoApi(data.jwt);

      if (data && user) {
        login(data.jwt, data.jwtRefreshToken, user);

        setUserDetailsLoaded(true);
      }
    } finally {
      setLoadingUserDetails(false);
    }
  };

  return (
    <div className="app">
      {loadingUserDetails ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
          }}
        >
          <Spin tip="Loading user information..." />
        </div>
      ) : (
        <LoginForm
          handleLogin={handleLogin}
          handleGoogleLogin={() => {}}
          handleFacebookLogin={() => {}}
        />
      )}
    </div>
  );
};

export default LoginComponent;
