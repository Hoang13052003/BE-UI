import RegisterForm from "../pages/auth/RegisterForm";

const RegisterComponent = () => {
  const handleRegister = (message: string) => {
    alert(message);
    // Chuyển hướng tới dashboard hoặc trang chính sau khi đăng ký
    window.location.href = "/login";
  };

  return <RegisterForm handleRegister={handleRegister} />;
};

export default RegisterComponent;
