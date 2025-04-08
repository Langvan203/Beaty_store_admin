"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { User } from "@/app/types/user";
interface AuthContextProps {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  refreshUser: (customToken?: string) => Promise<void>; // Đã sửa
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("adminToken");
    const storedUser = localStorage.getItem("adminUser");

    if (storedToken) {
      setToken(storedToken);
      if (storedUser) setUser(JSON.parse(storedUser));
    }
    setIsLoading(false)
  }, []);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  const refreshUser = async (customToken?: string) => {
    const tokenToUse = customToken || token; // Sử dụng customToken nếu có, nếu không dùng token từ state
    if (!tokenToUse) {
      return;
    }
    try {
      const res = await fetch("http://localhost:5000/api/User/GetUserInfo", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${tokenToUse}`,
        },
      }).then((res) => res.json()).then((res) => {
        console.log(res.data)
        if (res.status === 1) {
          console.log(res.data)
          setUser(res.data)
          sessionStorage.setItem("user", JSON.stringify(res.data));
        }
        else {
          console.log("lỗi cập nhật thông tin")
        }
      });
    } catch (error) {
      console.error("Error refreshing user:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ token, user, isLoading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}