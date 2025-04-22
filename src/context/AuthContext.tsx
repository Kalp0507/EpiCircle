
import React, { createContext, useContext, useState, useEffect } from "react";
import { User, UserRole } from "@/types";

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string, phone?: string) => Promise<void>;
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

  // Mock authentication for demo purposes
  useEffect(() => {
    // Simulate loading auth state
    const timer = setTimeout(() => {
      const savedUser = localStorage.getItem("bidboost_user");
      if (savedUser) {
        setCurrentUser(JSON.parse(savedUser));
      }
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const signIn = async (email: string, password: string, phone?: string) => {
    // Mock sign in - would be replaced with actual Firebase auth
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // For demo, we'll create sample users for each role
      let mockUser: User;

      if (email.includes("customer")) {
        mockUser = { id: "cust1", name: "Customer Demo", email, role: "customer", phone };
      } else if (email.includes("vendor")) {
        mockUser = { id: "vend1", name: "Vendor Demo", email, role: "vendor", phone };
      } else if (email.includes("intern")) {
        mockUser = { id: "int1", name: "Intern Demo", email, role: "intern", phone };
      } else {
        // Default to customer
        mockUser = { id: "cust2", name: "Default Customer", email, role: "customer", phone };
      }

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
    // Mock sign up - would be replaced with actual Firebase auth
    setIsLoading(true);
    try {
      // Simulate API call
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
    // Mock sign out
    setIsLoading(true);
    try {
      // Simulate API call
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
