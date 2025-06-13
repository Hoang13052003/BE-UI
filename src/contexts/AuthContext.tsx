import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import useLocalStorage from "../hooks/useLocalStorage";
import { message } from "antd";
import notificationService from "../services/NotificationService";

interface UserDetails {
  id: number;
  email: string;
  fullName: string;
  image: string | null;
  note: string | null;
  role: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  userRole: string | null;
  userDetails: UserDetails | null;
  token: string | null;
  refreshToken: string | null;
  loading: boolean;
  login: (
    token: string,
    refreshToken: string,
    userDetails: UserDetails
  ) => void;
  logout: () => void;
  updateUserDetails: (details: UserDetails) => void;
  updateToken: (newToken: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [token, setToken] = useLocalStorage<string | null>("token", null);
  const [refreshToken, setRefreshToken] = useLocalStorage<string | null>(
    "tokenRefresh",
    null
  );
  const [userDetails, setUserDetails] = useLocalStorage<UserDetails | null>(
    "userDetails",
    null
  );
  const [userRole, setUserRole] = useLocalStorage<string | null>(
    "userRole",
    null
  );
  // Non-persistent state
  const [loading, setLoading] = useState<boolean>(true);
  const [initialized, setInitialized] = useState<boolean>(false);

  // Derived state
  const isAuthenticated = !!token && !!userDetails;
  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      try {
        if (token && userDetails) {
          notificationService.connect(token);
        }
      } catch (error) {
        clearAuthState();
        message.error("Session expired. Please login again.");
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    };

    if (!initialized) {
      initializeAuth();
    }
  }, []);

  const clearAuthState = () => {
    setToken(null);
    setRefreshToken(null);
    setUserDetails(null);
    setUserRole(null);

    // Disconnect from WebSocket when logging out
    notificationService.disconnect();
  };

  const login = (
    newToken: string,
    newRefreshToken: string,
    userDetails: UserDetails
  ) => {
    setToken(newToken);
    setRefreshToken(newRefreshToken);
    setUserDetails(userDetails);
    setUserRole(userDetails.role);
    // Connect to WebSocket after successful login
    notificationService.connect(newToken);
  };

  // Logout function
  const logout = () => {
    // Disconnect from WebSocket before clearing auth state
    notificationService.disconnect();

    // Clear auth state
    clearAuthState();

    message.info("You have been logged out.");
  };

  // Hàm cập nhật user details (tùy chọn)
  const updateUserDetails = (details: UserDetails) => {
    setUserDetails(details);
  };

  // Update token (e.g., after refresh)
  const updateToken = (newToken: string) => {
    setToken(newToken);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        userRole,
        userDetails,
        token,
        refreshToken,
        loading,
        login,
        logout,
        updateUserDetails,
        updateToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
