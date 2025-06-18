import { useSearchParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Input, Button, Form } from "antd";
import image from "../../assets/image-reset-password.svg";
import { useFormik } from "formik";
import { resetPasswordApi } from "../../api/authApi";
import { useTranslation } from "react-i18next";

const ResetPasswordPage: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const resettoken = searchParams.get("token");
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!resettoken) {
      navigate("/login");
    }
  }, [resettoken, navigate]);

  interface ResetPasswordValues {
    token: string;
    newPassword: string;
    passwordConfirmation: string;
  }

  const handleSubmit = async (values: ResetPasswordValues) => {
    const { token, newPassword, passwordConfirmation } = values;
    try {
      setLoading(true);

      if (newPassword !== passwordConfirmation) {
        alert("Passwords do not match. Please check again.");
        return;
      }

      const data = await resetPasswordApi(token, newPassword);

      console.log("Password reset successful:", data);
      alert("Password reset successful!");
      navigate("/login");
    } catch (error) {
      console.error("Error resetting password:", error);
      alert("Password reset failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  const formik = useFormik<ResetPasswordValues>({
    initialValues: {
      token: resettoken || "",
      newPassword: "",
      passwordConfirmation: "",
    },
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
          <h1 className="welcome-text">{t("common.welcomeback")} 👋</h1>
          <p className="login-description">
            {t("auth.forgotPassword.description")}
          </p>

          <Form
            className="login-form"
            onFinish={formik.handleSubmit}
            layout="vertical"
          >
            <Form.Item
              label="New password"
              validateStatus={formik.touched.newPassword ? "error" : ""}
              help={formik.touched.newPassword}
            >
              <Input.Password
                id="newPassword"
                name="newPassword"
                placeholder={t("auth.input.newPassword")}
                size="large"
                value={formik.values.newPassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </Form.Item>
            <Form.Item
              label="Password confirmation"
              validateStatus={
                formik.touched.passwordConfirmation ? "error" : ""
              }
              help={formik.touched.passwordConfirmation}
            >
              <Input.Password
                id="passwordConfirmation"
                name="passwordConfirmation"
                placeholder={t("auth.input.newPasswordConfirm")}
                size="large"
                value={formik.values.passwordConfirmation}
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
                {t("auth.resetPassword")}
              </Button>
            </Form.Item>

            <div className="account-options">
              <p>
                {t("auth.register.exist-account")}{" "}
                <a href="/login">{t("auth.login.title")}</a>
              </p>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
