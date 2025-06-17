import React, { useState } from "react";
import { Input, Button, Form, Alert } from "antd";
// import {
//   FacebookFilled,
//   GoogleOutlined,
//   TwitterOutlined,
// } from "@ant-design/icons";
import image from "../../assets/Image-login-page.svg";
import * as yup from "yup";
import { useFormik } from "formik";
import { forgotPasswordApi, loginApi, LoginResponse } from "../../api/authApi";
import { useTranslation } from "react-i18next";
import { useAlert } from "../../contexts/AlertContext";

const validationSchema = yup.object({
  email: yup
    .string()
    .required("Email is required")
    .test("is-valid", "Enter a valid email or username", (value) => {
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
  handleLogin: (data: LoginResponse) => void;
  handleGoogleLogin: () => void;
  handleFacebookLogin: () => void;
}

const LoginForm: React.FC<LoginFormProps> = (props) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const { addAlert } = useAlert();

  const handleSubmit = async (values: LoginFormValues) => {
    try {
      setLoading(true);
      const { email, password } = values;

      await props.handleLogin(await loginApi(email, password));
    } catch (error: unknown) {
      let errorMessage = "Incorrect email or password. Please try again!";

      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as {
          response?: { data?: { message?: string } };
        };
        if (axiosError.response?.data?.message) {
          errorMessage = axiosError.response.data.message;
        }
      }

      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (values: LoginFormValues) => {
    try {
      const { email } = values;

      if (!email) {
        alert("Please enter your email.");
        return;
      }
      await forgotPasswordApi(email);
      addAlert("Password reset link sent to your email.", "success");
    } catch (error) {
      console.error("Error sending password reset link:", error);
      addAlert("Error sending password reset link.", "error");
    }
  };

  const formik = useFormik<LoginFormValues>({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema,
    onSubmit: handleSubmit,
  });

  return (
    <div className="login-container">
      {message && (
        <Alert
          style={{
            position: "fixed",
            top: 20,
            right: 20,
            zIndex: 1000,
          }}
          message={message}
          type="error"
          showIcon
          className="mb-4"
        />
      )}
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
            {t("common.welcome")}{" "}
            <span className="brand-name">{t("common.appName")}</span>
          </h1>

          <Form
            className="login-form"
            onFinish={formik.handleSubmit}
            layout="vertical"
          >
            <Form.Item
              label="Email"
              validateStatus={
                formik.touched.email && formik.errors.email ? "error" : ""
              }
              help={formik.touched.email && formik.errors.email}
            >
              <Input
                id="email"
                name="email"
                placeholder={t("auth.input.email")}
                size="large"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </Form.Item>

            <Form.Item
              label={t("auth.password")}
              validateStatus={
                formik.touched.password && formik.errors.password ? "error" : ""
              }
              help={formik.touched.password && formik.errors.password}
            >
              <Input.Password
                id="password"
                name="password"
                placeholder={t("auth.input.password")}
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
                {t("auth.login.title")}
              </Button>
            </Form.Item>

            <div className="account-options">
              <p>
                {t("auth.login.new")}{" "}
                <a href="/register">{t("auth.login.register")}</a>
              </p>
            </div>

            <div className="forgot-password" style={{ textAlign: "center" }}>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleForgotPassword(formik.values);
                }}
              >
                {t("auth.login.forgotPassword")}
              </a>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
