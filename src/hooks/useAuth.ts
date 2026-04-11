import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  const checkOnboarding = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("phone, interests")
        .eq("user_id", userId)
        .maybeSingle();
      
      if (!error && data) {
        setNeedsOnboarding(!data.phone || !data.interests || data.interests.length === 0);
      } else {
        setNeedsOnboarding(true);
      }
    } catch (err) {
      console.error("Error checking onboarding status:", err);
    }
  };

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
      if (session?.user) {
        checkOnboarding(session.user.id);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        setLoading(false);
        
        if (currentUser) {
          checkOnboarding(currentUser.id);
        } else {
          setNeedsOnboarding(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return { user, loading, needsOnboarding, signOut, refreshOnboarding: () => user && checkOnboarding(user.id) };
};
