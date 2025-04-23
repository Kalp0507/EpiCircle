
import React, { createContext, useContext, useState, useEffect } from "react";
import { User, UserRole } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string, phone?: string, role?: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, role: UserRole, phone?: string) => Promise<void>;
  signOut: () => Promise<void>;
  navigate: (path: string) => void;
}

const AuthContext = createContext<AuthContextType>(null!);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // This is a navigation function that will be overridden by useAuthNavigation
  const navigate = (path: string) => {
    console.log("Default navigating to:", path);
    window.location.href = path; // Fallback for when React Router is not available
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event);
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profile) {
            setCurrentUser({
              id: profile.id,
              name: profile.name,
              email: profile.email,
              role: profile.role as UserRole,  // Cast to UserRole type
              phone: profile.phone || undefined,
            });
          }
        } else {
          setCurrentUser(null);
        }
        setIsLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data: profile }) => {
            if (profile) {
              setCurrentUser({
                id: profile.id,
                name: profile.name,
                email: profile.email,
                role: profile.role as UserRole,  // Cast to UserRole type
                phone: profile.phone || undefined,
              });
            }
            setIsLoading(false);
          });
      } else {
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string, phone?: string, role?: string) => {
    setIsLoading(true);
    try {
      // Try to sign in with Supabase
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      
      // For demo purposes: Create a mock user if role is provided
      if (role) {
        console.log("Creating mock user with role:", role);
        
        // Create a mock user
        const mockUser = {
          id: "demo-user-id",
          name: email.split("@")[0],
          email,
          role: role as UserRole,
          phone
        };
        
        setCurrentUser(mockUser);
        console.log("Mock user created:", mockUser);
        
        // Use a more robust solution - first set state, then navigate after a small delay
        setTimeout(() => {
          console.log("Redirecting to dashboard after delay");
          navigate("/dashboard");
        }, 300);
      } else {
        // Normal flow - wait for auth state change to populate currentUser
        console.log("Signed in successfully, waiting for auth state to update");
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error signing in",
        description: error.message
      });
      setIsLoading(false);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, name: string, role: UserRole, phone?: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role,
            phone
          }
        }
      });

      if (error) throw error;
      
      toast({
        title: "Account created successfully",
        description: "Please check your email to verify your account."
      });
      
      // Use a more reliable navigation method
      setTimeout(() => {
        navigate("/signin");
      }, 100);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error signing up",
        description: error.message
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setCurrentUser(null);
      
      // Use a more reliable navigation method
      setTimeout(() => {
        navigate("/signin");
      }, 100);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error signing out",
        description: error.message
      });
      throw error;
    }
  };

  const value = {
    currentUser,
    isLoading,
    signIn,
    signUp,
    signOut,
    navigate,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
