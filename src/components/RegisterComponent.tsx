import RegisterForm from "../pages/auth/RegisterForm";

const RegisterComponent = () => {
  const handleRegister = (message: string) => {
    alert(message);
    window.location.href = "/login";
  };

  return <RegisterForm handleRegister={handleRegister} />;
};

export default RegisterComponent;
