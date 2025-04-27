import React, { createContext, ReactNode, useContext } from 'react';
import useLocalStorage from '../hooks/useLocalStorage'; // Đảm bảo đường dẫn này đúng

interface UserDetails {
  // Định nghĩa các trường thông tin người dùng mà API trả về
  id: number;
  email: string;
  fullName: string;
  image: string;
  note: string;
  role: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  userRole: string | null;
  userDetails: UserDetails | null; // Thêm trường này
  login: (role: string, details: UserDetails) => void; // Cập nhật hàm login
  logout: () => void;
  // Có thể thêm hàm cập nhật user details nếu cần
  updateUserDetails?: (details: UserDetails) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [storedRole, setStoredRole] = useLocalStorage<string | null>('userRole', null);
  const [userDetails, setUserDetails] = useLocalStorage<UserDetails | null>('userDetails',null); // State cho user details
  const isAuthenticated = !!storedRole;
  const userRole = storedRole;

  const login = (role: string, details: UserDetails) => {
    setStoredRole(role);
    setUserDetails(details); // Lưu thông tin người dùng
  };

  const logout = () => {
    setStoredRole(null);
    setUserDetails(null);
  };

  // Hàm cập nhật user details (tùy chọn)
  const updateUserDetails = (details: UserDetails) => {
    setUserDetails(details);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userRole, userDetails, login, logout, updateUserDetails }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};