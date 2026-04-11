import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, MapPin, Sparkles, ArrowLeft, ArrowUpRight, ShieldCheck, TrendingUp, Compass } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import SafeImage from "@/components/ui/SafeImage";
import { supabase } from "@/integrations/supabase/client";

import { Destination, INDIA_DESTINATIONS, WORLD_DESTINATIONS } from "@/data/destinations";


const Trending = () => {
  const { t } = useTranslation();
  const [view, setView] = useState<"india" | "world">("india");
  const [visibleCount, setVisibleCount] = useState(8);
  const destinations = view === "india" ? INDIA_DESTINATIONS : WORLD_DESTINATIONS;
  const currentDestinations = destinations.slice(0, visibleCount);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    setVisibleCount(8); // Reset count when switching tabs
  }, [view]);

  const handleLoadMore = () => {
    setVisibleCount(prev => Math.min(prev + 4, destinations.length));
  };

  return (
    <div className="min-h-screen pt-24 pb-20 bg-background overflow-x-hidden">
      {/* Background Mesh */}
      <div className="fixed inset-0 pointer-events-none opacity-40">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_20%,rgba(37,99,235,0.1),transparent_40%),radial-gradient(circle_at_80%_80%,rgba(217,119,6,0.1),transparent_40%)]" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-16">
          <div className="space-y-4 text-center md:text-left">
            <Link to="/" className="inline-flex items-center gap-2 text-primary font-bold text-sm group">
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" /> {t('trending_page.back')}
            </Link>
            <h1 className="text-5xl md:text-7xl font-display font-black tracking-tighter text-foreground">
              {t('trending_page.title_ai')}
            </h1>
            <p className="text-muted-foreground text-lg max-w-xl">
              {t('trending_page.subtitle')}
            </p>
          </div>

          <div className="flex p-1.5 bg-muted/30 rounded-2xl border border-white/10 backdrop-blur-md">
            <button
              onClick={() => setView("india")}
              className={`px-8 py-3 rounded-xl text-sm font-bold transition-all ${view === "india" ? "bg-primary text-white shadow-glow scale-105" : "text-muted-foreground hover:text-foreground"
                }`}
            >
              {t('trending_page.india')}
            </button>
            <button
              onClick={() => setView("world")}
              className={`px-8 py-3 rounded-xl text-sm font-bold transition-all ${view === "world" ? "bg-primary text-white shadow-glow scale-105" : "text-muted-foreground hover:text-foreground"
                }`}
            >
              {t('trending_page.world')}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-8">
          <AnimatePresence mode="popLayout" initial={false}>
            {currentDestinations.map((dest, i) => (
              <motion.div
                key={dest.id}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ duration: 0.4, delay: (i % 8) * 0.05 }}
                className="group relative flex flex-col rounded-[2.5rem] bg-card border border-white/10 overflow-hidden shadow-2xl hover:shadow-primary/10 transition-all duration-500 cursor-pointer"
                onClick={() => navigate(`/destination/${dest.id}`, { state: { destination: dest } })}
              >
                <div className="relative h-72 overflow-hidden">
                  <SafeImage
                    src={dest.image}
                    alt={dest.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                    query={`${dest.name}, ${dest.location}`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80" />

                  <div className="absolute top-6 left-6 flex flex-col gap-2">
                    <span className="px-4 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-[10px] font-bold text-white uppercase tracking-widest flex items-center gap-1.5">
                      <Sparkles className="h-3 w-3 text-secondary" /> {dest.badge}
                    </span>
                  </div>

                <div className="absolute bottom-6 left-6">
                  <div className="flex items-center gap-2 text-white/80 text-[10px] font-bold uppercase tracking-wider mb-1">
                    <MapPin className="h-3 w-3" /> {dest.location}
                  </div>
                    <h3 className="text-3xl font-bold text-white tracking-tight">{dest.name}</h3>
                  </div>
                </div>

                <div className="p-8 flex flex-col flex-1">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                      <Compass className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t('trending_page.analysis')}</p>
                      <p className="text-sm font-semibold text-foreground leading-snug">{dest.reason}</p>
                    </div>
                  </div>

                  <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="text-xs font-bold text-muted-foreground">{t('trending_page.high_demand')}</span>
                    </div>
                    <Button
                      onClick={() => navigate("/planner", { state: { destination: dest.name, interests: [dest.tag] } })}
                      className="rounded-full h-10 w-10 p-0 bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all shadow-soft"
                    >
                      <ArrowUpRight className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Dynamic Controls */}
        <div className="mt-20 flex flex-col items-center gap-8">
          {visibleCount < destinations.length ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Button
                onClick={handleLoadMore}
                className="btn-hero h-14 px-10 rounded-2xl text-lg font-bold group shadow-glow"
              >
                {t('trending_page.discover_more')} <TrendingUp className="ml-2 h-5 w-5 group-hover:scale-110 transition-transform" />
              </Button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6"
            >
              <div className="inline-flex items-center gap-2 rounded-full bg-secondary/10 px-4 py-2 text-xs font-bold text-secondary border border-secondary/20">
                <Globe className="h-3 w-3" />
                <span>{t('trending_page.all_explored')}</span>
              </div>
              <h3 className="text-2xl font-bold text-foreground">{t('trending_page.want_more')}</h3>
              <Button
                onClick={() => navigate("/planner")}
                className="btn-hero h-16 px-12 rounded-[2rem] text-xl font-black bg-white text-black hover:bg-white/90 border-none shadow-2x-glow"
              >
                {t('trending_page.generate_fresh')} <Sparkles className="ml-3 h-6 w-6 text-primary" />
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Trending;
