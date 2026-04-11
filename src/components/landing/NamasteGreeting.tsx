import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";

const NamasteGreeting = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [profileName, setProfileName] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (!error && data?.display_name) {
        setProfileName(data.display_name);
      }
    };

    fetchProfile();

    // Subscribe to profile changes
    const channel = supabase
      .channel("profile-updates")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.new && (payload.new as any).display_name) {
            setProfileName((payload.new as any).display_name);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);
  
  // Extract name from profile, user metadata or email
  const displayName = profileName || 
                      user?.user_metadata?.full_name || 
                      user?.email?.split('@')[0] || 
                      "Traveler";

  return (
    <section className="relative py-20 px-6 overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary/10 rounded-full blur-[120px] -z-10" />
      
      <div className="container mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm text-xs font-bold uppercase tracking-[0.3em] text-primary mb-2"
          >
            {t('greeting.welcome')}
          </motion.div>
          
          <h2 className="font-serif italic text-5xl md:text-7xl lg:text-8xl text-foreground leading-tight">
            {t('greeting.namaste')}, <span className="text-gradient not-italic font-black">{displayName}</span>
          </h2>
          
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto font-medium"
          >
            {t('greeting.desc')}
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
};

export default NamasteGreeting;
