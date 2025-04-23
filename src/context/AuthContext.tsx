import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/supabaseClient"; // Update path if needed
import { User, UserRole } from "@/types";

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
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

  // Listen to auth changes
  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        const { data: profile } = await supabase
          .from("users")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (profile) {
          setCurrentUser({
            id: profile.id,
            name: profile.name,
            email: profile.email,
            role: profile.role,
            phone: profile.phone,
          });
        }
      }
      setIsLoading(false);
    };

    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        setCurrentUser(null);
      }
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, name: string, role: UserRole, phone?: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
  
      if (error) throw error;
  
      // optionally insert user metadata into your custom users table
      if (data.user) {
        await supabase.from("users").insert({
          id: data.user.id,
          email,
          name,
          role,
          phone,
        });
      }
  
      if (data.user && data.user.id) {
        setCurrentUser({ id: data.user.id, email, name, role, phone });
        localStorage.setItem("bidboost_user", JSON.stringify({ id: data.user.id, email, name, role, phone }));
      }
    } catch (err) {
      console.error("Sign up error:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
  
      if (error) throw error;
  
      const { data: profile } = await supabase
        .from("users")
        .select("*")
        .eq("id", data.user?.id)
        .single();
  
      setCurrentUser(profile);
      localStorage.setItem("bidboost_user", JSON.stringify(profile));
    } catch (err) {
      console.error("Sign in error:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setCurrentUser(null);
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
