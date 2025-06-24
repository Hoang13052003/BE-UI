import { useAlert } from "../contexts/AlertContext";
import RegisterForm from "../pages/auth/RegisterForm";

const RegisterComponent = () => {
  const { addAlert } = useAlert();
  const handleRegister = (message: string) => {
    addAlert(message, "success");
    addAlert("Please check your email to verify your account!", "warning");
    setTimeout(() => {
      window.location.href = "/login";
    }, 3000);
  };

  return <RegisterForm handleRegister={handleRegister} />;
};

export default RegisterComponent;
