import React, { createContext, useContext, useState, useEffect } from "react";
import { User, UserRole } from "@/types";
import { supabase } from "@/supabaseClient";
import bcrypt from "bcryptjs";

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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    setIsLoading(false)
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
      const { data: existingUsers, error: fetchError } = await supabase
        .from("users")
        .select("*")
        .eq("phone", userData.phone);

      if (fetchError) throw fetchError;
      if (existingUsers.length > 0) throw new Error("Phone number already registered");

      const hashedPassword = await bcrypt.hash(userData.password, 10);

      const { data: newUser, error: insertError } = await supabase
        .from("users")
        .insert({
          name: userData.name,
          phone: userData.phone,
          password: hashedPassword,
          role: userData.role,
          location: userData.location || null,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      const { password, ...userWithoutPassword } = newUser;
      setCurrentUser(userWithoutPassword);
      localStorage.setItem("user", JSON.stringify(userWithoutPassword));
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
      const { data: users, error } = await supabase
        .from("users")
        .select("*")
        .eq("phone", phone)
        .single();

      if (error || !users) throw new Error("Invalid phone number or password");

      const isMatch = await bcrypt.compare(password, users.password);
      if (!isMatch) throw new Error("Invalid phone number or password");

      const { password: _, ...userWithoutPassword } = users;
      setCurrentUser(userWithoutPassword);
      localStorage.setItem("user", JSON.stringify(userWithoutPassword));
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
      localStorage.removeItem("user");
    } catch (error) {
      console.error("Sign out error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, isLoading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
