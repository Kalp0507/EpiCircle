
import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Session } from "@supabase/supabase-js";
import { UserRole } from "@/types";

type Profile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role?: UserRole | null;
};

interface AuthContextType {
  currentUser: (User & { role?: UserRole }) | null;
  profile: Profile | null;
  isLoading: boolean;
  signIn: (params: { email: string; password: string; }) => Promise<void>;
  signUp: (params: { email: string; password: string; full_name: string; phone: string; role: UserRole }) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  profile: null,
  isLoading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  refreshProfile: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<(User & { role?: UserRole }) | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  // Load session and subscribe to changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        const userWithRole = session.user;
        setCurrentUser(userWithRole);
        setTimeout(() => {
          refreshProfile(session.user.id);
        }, 0);
      } else {
        setCurrentUser(null);
        setProfile(null);
      }
    });
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        const userWithRole = session.user;
        setCurrentUser(userWithRole);
        refreshProfile(session.user.id);
      } else {
        setCurrentUser(null);
        setProfile(null);
      }
      setIsLoading(false);
    });
    
    return () => {
      subscription.unsubscribe();
    };
    // eslint-disable-next-line
  }, []);

  const refreshProfile = async (id?: string) => {
    setIsLoading(true);
    try {
      const userId = id || currentUser?.id;
      if (!userId) return;
      
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      
      if (error) {
        console.error("Error fetching profile:", error);
        setProfile(null);
      } else {
        setProfile(data as Profile);
        // Update currentUser with role from profile
        if (currentUser && data.role) {
          setCurrentUser({
            ...currentUser,
            role: data.role as UserRole
          });
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Sign in with email/password
  const signIn = async ({ email, password }: { email: string; password: string }) => {
    setIsLoading(true);
    try {
      if (!email || !password) throw new Error("Email and password required");
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (error: any) {
      console.error("Sign in error:", error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Sign up with email/password
  const signUp = async ({ email, password, full_name, phone, role }: { email: string; password: string; full_name: string; phone: string; role: UserRole }) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { 
            full_name, 
            phone, 
            role 
          }
        },
      });
      
      if (error) throw error;
      
    } catch (error: any) {
      console.error("Sign up error:", error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
      setProfile(null);
      setCurrentUser(null);
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    currentUser,
    profile,
    isLoading,
    signIn,
    signUp,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
