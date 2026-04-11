import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, MapPin, Calendar, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Trip {
  id: string;
  destination: string;
  start_place: string | null;
  days: number;
  budget: string | null;
  companion: string | null;
  interests: string[] | null;
  start_date: string | null;
  itinerary_data: any;
  created_at: string;
}

const Dashboard = () => {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setTrips([]);
      setLoading(false);
      return;
    }

    const fetchTrips = async () => {
      try {
        const { data, error } = await supabase
          .from("itineraries")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setTrips(data as Trip[]);
      } catch (err) {
        console.error("Failed to fetch trips:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, [user]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const { error } = await supabase
        .from("itineraries")
        .delete()
        .eq("id", deleteId);
      
      if (error) throw error;
      setTrips((prev) => prev.filter((t) => t.id !== deleteId));
    } catch (err) {
      console.error("Failed to delete trip:", err);
    } finally {
      setDeleteId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center pt-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen pt-20 pb-16 overflow-hidden">
      {/* Background with Overlay */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ 
        backgroundImage: `url('/dashboard-bg.png')`,
        }}
      >
        <div className="absolute inset-0 bg-background/60 backdrop-blur-[3px]" />
      </div>

      <div className="container relative z-10 mx-auto max-w-5xl px-4 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          
          {/* Header & Stats Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary border border-primary/20 mb-3">
                <MapPin className="h-3 w-3" />
                <span>{t('dashboard.title')}</span>
              </div>
              <h1 className="font-display text-4xl lg:text-5xl font-bold text-foreground">
                {t('dashboard.adventures')}
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="glass-panel px-6 py-3 flex flex-col items-center border-primary/10">
                <span className="text-2xl font-bold text-primary">{trips.length}</span>
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">{t('dashboard.trips_saved')}</span>
              </div>
              <div className="glass-panel px-6 py-3 flex flex-col items-center border-secondary/10">
                <span className="text-2xl font-bold text-secondary">
                  {trips.reduce((acc, t) => acc + t.days, 0)}
                </span>
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">{t('dashboard.days_planned')}</span>
              </div>
              <Link to="/planner">
                <Button className="btn-hero h-14 !rounded-2xl gap-2 shadow-glow">
                  <Plus className="h-5 w-5" /> {t('dashboard.new_trip')}
                </Button>
              </Link>
            </div>
          </div>

          {!user ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-panel py-20 text-center max-w-2xl mx-auto border-white/20"
            >
              <div className="h-20 w-20 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-6">
                <MapPin className="h-10 w-10 text-muted-foreground/40" />
              </div>
              <h3 className="mb-2 font-display text-2xl font-semibold text-foreground">{t('dashboard.signin_prompt')}</h3>
              <p className="mb-8 text-muted-foreground max-w-sm mx-auto">
                {t('dashboard.join_community')}
              </p>
              <Button onClick={() => window.location.href = '/'} className="btn-hero !px-8">{t('dashboard.get_started')}</Button>
            </motion.div>
          ) : trips.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-panel py-20 text-center max-w-2xl mx-auto border-white/20"
            >
              <div className="h-20 w-20 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-6">
                <MapPin className="h-10 w-10 text-muted-foreground/40" />
              </div>
              <h3 className="mb-2 font-display text-2xl font-semibold text-foreground">{t('dashboard.no_trips')}</h3>
              <p className="mb-8 text-muted-foreground max-w-sm mx-auto">
                {t('dashboard.future_adventures')}
              </p>
              <Link to="/planner">
                <Button className="btn-hero !px-8">{t('dashboard.plan_trip')}</Button>
              </Link>
            </motion.div>
          ) : (
            <div className="grid gap-6">
              <AnimatePresence>
                {trips.map((trip, i) => (
                  <motion.div
                    key={trip.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 50, scale: 0.95 }}
                    transition={{ delay: i * 0.05 }}
                    layout
                    className="glass-panel group relative flex flex-col md:flex-row md:items-center justify-between p-6 sm:p-8 border-white/10 hover:border-white/30 transition-all hover:translate-x-2"
                  >
                    <div className="flex items-center gap-6">
                      <div className="relative">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/20 text-primary border border-primary/10 shadow-glow transition-transform group-hover:rotate-12">
                          <MapPin className="h-7 w-7" />
                        </div>
                        {trip.days > 5 && (
                          <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold text-secondary-foreground shadow-soft">
                             ★
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-1">
                        <h3 className="font-display text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                          {trip.destination}
                        </h3>
                        <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-muted-foreground">
                          <span className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/5">
                            <Calendar className="h-3.5 w-3.5" /> {formatDate(trip.created_at)}
                          </span>
                          <span className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/5">
                            {trip.days} {t('dashboard.days_suffix')}
                          </span>
                          {trip.companion && (
                            <span className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/5">
                              {trip.companion}
                            </span>
                          )}
                          {trip.budget && (
                            <span className="font-bold text-secondary text-base ml-2">
                              ₹{Number(trip.budget).toLocaleString("en-IN")}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mt-6 md:mt-0">
                      <Link
                        to="/itinerary"
                        className="flex-1 md:flex-none"
                        state={{
                          itinerary: trip.itinerary_data,
                          form: {
                            destination: trip.destination,
                            startPlace: trip.start_place,
                            days: String(trip.days),
                            budget: trip.budget,
                            interests: trip.interests,
                            companion: trip.companion,
                            startDate: trip.start_date,
                          },
                          savedId: trip.id,
                        }}
                      >
                        <Button className="w-full bg-white/10 hover:bg-white/20 text-foreground border-white/10 !rounded-xl transition-all">
                          {t('dashboard.view_details')}
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 text-destructive/60 hover:text-destructive hover:bg-destructive/10 !rounded-xl"
                        onClick={() => setDeleteId(trip.id)}
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </div>

      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="max-w-[90vw] sm:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">{t('dashboard.delete_trip')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('dashboard.delete_confirm')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('dashboard.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {t('dashboard.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Dashboard;
