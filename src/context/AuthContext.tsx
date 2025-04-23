
import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Session } from "@supabase/supabase-js";

type Profile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
};

interface AuthContextType {
  currentUser: User | null;
  profile: Profile | null;
  isLoading: boolean;
  signIn: (params: { email?: string; password?: string; provider?: "google" | "twitter" | "github" }) => Promise<void>;
  signUp: (params: { email: string; password: string; full_name: string; phone: string }) => Promise<void>;
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
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  // Load session and subscribe to changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setCurrentUser(session?.user ?? null);
      if (session?.user) {
        setTimeout(() => {
          refreshProfile(session.user.id);
        }, 0);
      } else {
        setProfile(null);
      }
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setCurrentUser(session?.user ?? null);
      if (session?.user) {
        refreshProfile(session.user.id);
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
      const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single();
      if (error) {
        setProfile(null);
      } else {
        setProfile(data as Profile);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Sign in with email/password or social
  const signIn: AuthContextType["signIn"] = async ({ email, password, provider }) => {
    setIsLoading(true);
    try {
      if (provider) {
        const { error } = await supabase.auth.signInWithOAuth({
          provider,
        });
        if (error) throw error;
        return;
      }
      if (!email || !password) throw new Error("Email and password required");
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Sign up with email/password
  const signUp: AuthContextType["signUp"] = async ({ email, password, full_name, phone }) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name, phone },
        },
      });
      if (error) throw error;
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
