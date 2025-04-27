import React, { useState } from "react";
import { Input, Button, Form } from "antd";
import { useFormik } from "formik";
import * as yup from "yup";
import image from "../../assets/Image-login-page.svg";
import { signupApi } from "../../api/authApi";
// import { useNavigate } from "react-router-dom";

const validationSchema = yup.object({
  fullName: yup.string().min(3, "fullName must be at least 3 characters").required("fullName is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password"), ""], "Passwords must match")
    .required("Confirm Password is required"),
});

interface RegisterValues {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface RegisterProps {
  handleRegister: (message: string) => void;
}

const RegisterForm: React.FC<RegisterProps> = (props) => {
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (values: RegisterValues) => {
    try {
      setLoading(true);
      const { email, password, fullName } = values;

      const data = await signupApi(email, password, fullName);
      
      props.handleRegister(data.message);
    } catch (err) {
      console.error("register error:", err);
    } finally {
      setLoading(false);
    }
  };

  const formik = useFormik<RegisterValues>({
    initialValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validationSchema,
    onSubmit: handleSubmit,
  });

  return (
    <div className="register-container">
      <div className="register-content">
        <div className="register-illustration">
          <img src={image} alt="register illustration" className="illustration-image" />
        </div>

        <div className="register-form-container">
          <h1 className="welcome-text">Join <span className="brand-name">ProgressHub</span></h1>
          <p className="register-description">Create your account to get started</p>

          <Form className="register-form" layout="vertical" onFinish={formik.handleSubmit}>
            <Form.Item
              label="Full Name"
              validateStatus={formik.touched.fullName && formik.errors.fullName ? "error" : ""}
              help={formik.touched.fullName && formik.errors.fullName}
            >
              <Input
                name="fullName"
                placeholder="Enter your fullName"
                size="large"
                value={formik.values.fullName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </Form.Item>

            <Form.Item
              label="Email"
              validateStatus={formik.touched.email && formik.errors.email ? "error" : ""}
              help={formik.touched.email && formik.errors.email}
            >
              <Input
                name="email"
                placeholder="Enter your email"
                size="large"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </Form.Item>

            <Form.Item
              label="Password"
              validateStatus={formik.touched.password && formik.errors.password ? "error" : ""}
              help={formik.touched.password && formik.errors.password}
            >
              <Input.Password
                name="password"
                placeholder="Enter your password"
                size="large"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </Form.Item>

            <Form.Item
              label="Confirm Password"
              validateStatus={formik.touched.confirmPassword && formik.errors.confirmPassword ? "error" : ""}
              help={formik.touched.confirmPassword && formik.errors.confirmPassword}
            >
              <Input.Password
                name="confirmPassword"
                placeholder="Confirm your password"
                size="large"
                value={formik.values.confirmPassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                size="large"
                block
                htmlType="submit"
                loading={loading}
                className="sign-up-button"
              >
                Sign Up
              </Button>
            </Form.Item>

            <div className="account-options">
              <p>
                Already have an account? <a href="/login">Sign in</a>
              </p>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
