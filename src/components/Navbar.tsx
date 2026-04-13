import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Plane, LogOut, User as UserIcon, Settings, Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navLinks = [
  { to: "/", labelKey: "nav.home" },
  { to: "/trending", labelKey: "nav.trending" },
  { to: "/planner", labelKey: "nav.plan_trip" },
  { to: "/dashboard", labelKey: "nav.dashboard" }, 
];

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));
  const location = useLocation();
  const { user, loading, signOut } = useAuth();
  const [profileName, setProfileName] = useState<string | null>(null);
  const [profileAvatar, setProfileAvatar] = useState<string | null>(null);

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = saved === "dark" || (!saved && prefersDark);
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  useEffect(() => {
    if (!user) { setProfileName(null); setProfileAvatar(null); return; }
    
    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("display_name, avatar_url")
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (data && !error) {
        setProfileName(data.display_name);
        setProfileAvatar(data.avatar_url);
      }
    };
    
    fetchProfile();

    // Subscribe to profile changes
    const channel = supabase
      .channel(`profile-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "profiles",
          filter: `user_id=eq.${user.id}`,
        },
        (payload: any) => {
          if (payload.new) {
            setProfileName(payload.new.display_name);
            setProfileAvatar(payload.new.avatar_url);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin,
          queryParams: {
            prompt: 'select_account',
          },
        },
      });
      if (error) throw error;
    } catch (e: any) {
      console.error("Google sign in failed", e);
      toast({
        title: "Auth Failed",
        description: e?.message || "An unknown error occurred",
        variant: "destructive",
      });
    }
  };

  const avatarUrl = profileAvatar || (user?.user_metadata?.avatar_url as string | undefined);
  const displayName = profileName || (user?.user_metadata?.full_name as string | undefined) || user?.email?.split("@")[0] || "User";
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-panel border-b border-border/50">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
            <Plane className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold text-foreground">
            Travel <span className="text-gradient">Planner</span>
          </span>
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                location.pathname === l.to
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t(l.labelKey)}
            </Link>
          ))}

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="ml-1 rounded-lg p-2 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            aria-label="Toggle theme"
          >
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {/* Language Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger className="ml-1 flex items-center gap-1.5 rounded-lg border border-white/5 bg-white/5 px-2.5 py-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground transition-all hover:bg-primary/20 hover:text-primary outline-none focus-visible:ring-1 focus-visible:ring-primary">
              <Globe className="h-3 w-3" />
              {i18n.language === "en" ? "EN" : "HI"}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32 glass-panel border-border/50">
              <DropdownMenuItem 
                onClick={() => changeLanguage("en")}
                className={`cursor-pointer flex items-center justify-between ${i18n.language === "en" ? "text-primary font-bold" : ""}`}
              >
                English
                {i18n.language === "en" && <div className="h-1.5 w-1.5 rounded-full bg-primary" />}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => changeLanguage("hi")}
                className={`cursor-pointer flex items-center justify-between ${i18n.language === "hi" ? "text-primary font-bold" : ""}`}
              >
                हिन्दी
                {i18n.language === "hi" && <div className="h-1.5 w-1.5 rounded-full bg-primary" />}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Auth section */}
          {loading ? (
            <div className="ml-3 h-9 w-9 animate-pulse rounded-full bg-muted" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="ml-3 flex items-center gap-2 rounded-full outline-none ring-ring focus-visible:ring-2">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    className="h-9 w-9 rounded-full border-2 border-primary/20 object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                    {initials}
                  </div>
                )}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-3 py-2">
                  <p className="text-sm font-semibold text-foreground">{displayName}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/dashboard" className="cursor-pointer gap-2">
                    <UserIcon className="h-4 w-4" /> {t('nav.dashboard')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer gap-2">
                    <Settings className="h-4 w-4" /> {t('nav.profile')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut} className="cursor-pointer gap-2 text-destructive focus:text-destructive">
                  <LogOut className="h-4 w-4" /> {t('nav.signout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2 ml-3">
              <button 
                onClick={handleGoogleSignIn} 
                className="px-4 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                Login
              </button>
              <button 
                onClick={handleGoogleSignIn} 
                className="btn-hero !px-6 !py-2 !text-sm whitespace-nowrap"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>

        {/* Mobile toggle */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={toggleTheme}
            className="rounded-lg p-2 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            aria-label="Toggle theme"
          >
            {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          <button
            className="text-foreground"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-border md:hidden"
          >
            <div className="flex flex-col gap-1 p-4">
              {navLinks.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className={`rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                    location.pathname === l.to
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t(l.labelKey)}
                </Link>
              ))}
              
              {/* Mobile Language Selector */}
              <div className="mt-2 flex flex-col gap-1 border-t border-border pt-4">
                <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
                  {i18n.language === "en" ? "Select Language" : "भाषा चुनें"}
                </p>
                <div className="flex gap-2 px-2">
                  <button
                    onClick={() => { changeLanguage("en"); setOpen(false); }}
                    className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                      i18n.language === "en" 
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                        : "bg-accent/50 text-muted-foreground"
                    }`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => { changeLanguage("hi"); setOpen(false); }}
                    className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                      i18n.language === "hi" 
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                        : "bg-accent/50 text-muted-foreground"
                    }`}
                  >
                    हिन्दी
                  </button>
                </div>
              </div>
              {!loading && !user && (
                <div className="flex flex-col gap-2 mt-2">
                  <button
                    onClick={() => { setOpen(false); handleGoogleSignIn(); }}
                    className="w-full rounded-lg px-4 py-3 text-sm font-medium text-foreground bg-accent/50 text-center"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => { setOpen(false); handleGoogleSignIn(); }}
                    className="btn-hero w-full text-center !text-sm"
                  >
                    Sign Up
                  </button>
                </div>
              )}
              {!loading && user && (
                <div className="mt-2 flex items-center justify-between rounded-lg bg-muted px-4 py-3">
                  <div className="flex items-center gap-2">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={displayName} className="h-8 w-8 rounded-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">{initials}</div>
                    )}
                    <span className="text-sm font-medium text-foreground">{displayName}</span>
                  </div>
                  <button onClick={() => { setOpen(false); signOut(); }} className="text-sm text-destructive">
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
