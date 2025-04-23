import React, { createContext, useContext, useState, useEffect } from "react";
import { User, UserRole } from "@/types";

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string, phone?: string, role?: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, role: UserRole, phone?: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const defaultContext: AuthContextType = {
  currentUser: null,
  isLoading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
};

const AuthContext = createContext<AuthContextType>(defaultContext);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      const savedUser = localStorage.getItem("bidboost_user");
      if (savedUser) {
        setCurrentUser(JSON.parse(savedUser));
      }
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const signIn = async (email: string, password: string, phone?: string, role?: string) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      let userRole = role as "customer" | "vendor" | "intern" | undefined;

      if (!userRole) {
        if (email.includes("customer")) userRole = "customer";
        else if (email.includes("vendor")) userRole = "vendor";
        else if (email.includes("intern")) userRole = "intern";
        else userRole = "customer";
      }

      let mockUser: User = {
        id: userRole === "customer" ? "cust1" : userRole === "vendor" ? "vend1" : "int1",
        name: userRole === "customer" ? "Customer Demo" : userRole === "vendor" ? "Vendor Demo" : "Intern Demo",
        email,
        role: userRole,
        phone,
      };

      setCurrentUser(mockUser);
      localStorage.setItem("bidboost_user", JSON.stringify(mockUser));
    } catch (error) {
      console.error("Sign in error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string, role: UserRole, phone?: string) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockUser: User = {
        id: `user-${Date.now()}`,
        name,
        email,
        role,
        phone,
      };

      setCurrentUser(mockUser);
      localStorage.setItem("bidboost_user", JSON.stringify(mockUser));
    } catch (error) {
      console.error("Sign up error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setCurrentUser(null);
      localStorage.removeItem("bidboost_user");
    } catch (error) {
      console.error("Sign out error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    currentUser,
    isLoading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
