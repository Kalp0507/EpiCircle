
import React, { createContext, useContext, useState, useEffect } from "react";
import { User, UserRole } from "@/types";

// Mock data for users
const mockUsers = [
  {
    id: "1",
    name: "John Vendor",
    phone: "+1234567890",
    role: "vendor" as UserRole,
    location: "New York",
    password: "password"
  },
  {
    id: "2",
    name: "Alice Intern",
    phone: "+1987654321",
    role: "intern" as UserRole,
    location: "Chicago",
    password: "password"
  },
  {
    id: "3",
    name: "Bob Admin",
    phone: "+1122334455",
    role: "admin" as UserRole,
    password: "password"
  },
];

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  signIn: (phone: string, password: string) => Promise<void>;
  signUp: (userData: {
    name: string;
    phone: string;
    password: string;
    role: UserRole;
    location?: string;
  }) => Promise<void>;
  signOut: () => Promise<void>;
}

const defaultContext: AuthContextType = {
  currentUser: null,
  isLoading: false,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
};

const AuthContext = createContext<AuthContextType>(defaultContext);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Check for stored user on initial load
  useEffect(() => {
    const storedUser = localStorage.getItem("bidboost_user");
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

  const signUp = async (userData: {
    name: string;
    phone: string;
    password: string;
    role: UserRole;
    location?: string;
  }) => {
    setIsLoading(true);
    try {
      // Check if phone already exists
      const existingUser = mockUsers.find(user => user.phone === userData.phone);
      if (existingUser) {
        throw new Error("Phone number already registered");
      }
      
      // Create new user
      const newUser: User & { password: string } = {
        id: `user_${Date.now()}`,
        name: userData.name,
        phone: userData.phone,
        role: userData.role,
        location: userData.location,
        password: userData.password
      };
      
      mockUsers.push(newUser);
      
      // Set current user (without password)
      const { password, ...userWithoutPassword } = newUser;
      setCurrentUser(userWithoutPassword);
      localStorage.setItem("bidboost_user", JSON.stringify(userWithoutPassword));
      
    } catch (error) {
      console.error("Sign up error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const signIn = async (phone: string, password: string) => {
    setIsLoading(true);
    try {
      const user = mockUsers.find(user => user.phone === phone && user.password === password);
      if (!user) {
        throw new Error("Invalid phone number or password");
      }
      
      // Set current user (without password)
      const { password: _, ...userWithoutPassword } = user;
      setCurrentUser(userWithoutPassword);
      localStorage.setItem("bidboost_user", JSON.stringify(userWithoutPassword));
      
    } catch (error) {
      console.error("Sign in error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
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
