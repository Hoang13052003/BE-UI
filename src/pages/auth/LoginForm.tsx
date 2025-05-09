import React, { useState } from "react";
import { Input, Button, Form } from "antd";
// import {
//   FacebookFilled,
//   GoogleOutlined,
//   TwitterOutlined,
// } from "@ant-design/icons";
import image from "../../assets/Image-login-page.svg";
import * as yup from "yup";
import { useFormik } from "formik";
import { forgotPasswordApi, loginApi } from "../../api/authApi";
import { openErrorNotification } from "../../components/ErrorNotification";

const validationSchema = yup.object({
  email: yup
    .string()
    .required("Email or username is required")
    .test("is-valid", "Enter a valid email or username", (value) => {
      // Check if it's a valid email or just a username (at least 3 chars)
      const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
      return !!value && (emailRegex.test(value) || value.length >= 3);
    }),
  password: yup
    .string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters"),
});

interface LoginFormValues {
  email: string;
  password: string;
}

interface LoginFormProps {
  handleLogin: () => void;
  handleGoogleLogin: () => void;
  handleFacebookLogin: () => void;
}

const LoginForm: React.FC<LoginFormProps> = (props) => {
  const [loading, setLoading] = useState<boolean>(false);
  // const [snackBarMessage, setSnackBarMessage] = useState("");
  const handleSubmit = async (values: LoginFormValues) => {
    try {
      setLoading(true);
      const { email, password } = values;
      openErrorNotification("Login failed. Sai Pass or MK.");
      const data = await loginApi(email, password);
  
      console.log("Login data:", data);

      const accessToken = data.jwt;
      const tokenRefresh = data.jwtRefreshToken;
      // Gọi hàm xử lý login từ props
      if(accessToken) {
        localStorage.setItem('token', accessToken);
        localStorage.setItem('tokenRefresh', tokenRefresh);
        await props.handleLogin();
      }
      else {
        console.error("Login error: token is null");
      }
      
    } catch (error) {
      
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (values: LoginFormValues) => {
    try {
      const { email } = values;

      if(!email) {        
        alert("Please enter your email.");
        return;
      }

      const data = await forgotPasswordApi(email);

      console.log("Forgot password for email:", data);
      alert("Password reset link sent to your email.");
    } catch (error) {
      console.error("Error sending password reset link:", error);
    }

  }

  const formik = useFormik<LoginFormValues>({
    initialValues: {
      email: "koten686868@gmail.com",
      password: "123456",
    },
    validationSchema,
    onSubmit: handleSubmit,
  });

  return (
    <div className="login-container">
      <div className="login-content">
        <div className="login-illustration">
          <img
            src={image}
            alt="Login illustration"
            className="illustration-image"
          />
        </div>

        <div className="login-form-container">
          <h1 className="welcome-text">
            Welcome To <span className="brand-name">ProgressHub</span>
          </h1>
          <p className="login-description">
            Please sign-in to your account and start the adventure
          </p>

          <Form
            className="login-form"
            onFinish={formik.handleSubmit}
            layout="vertical"
          >
            <Form.Item
              label="Email"
              validateStatus={
                formik.touched.email && formik.errors.email
                  ? "error"
                  : ""
              }
              help={
                formik.touched.email && formik.errors.email
              }
            >
              <Input
                id="email"
                name="email"
                placeholder="Enter Your Email"
                size="large"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </Form.Item>

            <Form.Item
              label="Password"
              validateStatus={
                formik.touched.password && formik.errors.password ? "error" : ""
              }
              help={formik.touched.password && formik.errors.password}
            >
              <Input.Password
                id="password"
                name="password"
                placeholder="Enter Your Password"
                size="large"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                size="large"
                block
                className="sign-in-button"
                htmlType="submit"
                loading={loading}
              >
                Sign In
              </Button>
            </Form.Item>

            <div className="account-options">
              <p>
                New on our platform? <a href="/register">Create an account</a>
              </p>
              {/* <p className="or-divider">or</p>

              <div className="social-login">
                <Button
                  icon={<FacebookFilled />}
                  shape="circle"
                  className="social-button fa-brands fa-facebook-f facebook"
                />
                <Button
                  icon={<GoogleOutlined />}
                  shape="circle"
                  className="social-button google"
                />
                <Button
                  icon={<TwitterOutlined />}
                  shape="circle"
                  className="social-button twitter"
                />
              </div> */}
            </div>

            <div className="forgot-password">
              <a href="#" onClick={() => handleForgotPassword(formik.values)}>
                Forgot Password?
              </a>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
