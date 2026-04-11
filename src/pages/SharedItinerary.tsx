import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import DaySection from "@/components/itinerary/DaySection";
import ReviewSection from "@/components/itinerary/ReviewSection";
import { useTranslation } from "react-i18next";

interface Activity {
  time: string;
  title: string;
  description: string;
  cost: string;
  type: "attraction" | "food" | "transport" | "hotel";
}

interface Weather {
  temperature: string;
  condition: string;
  icon: string;
}

interface Day {
  day: number;
  title: string;
  weather?: Weather;
  activities: Activity[];
}

interface ItineraryData {
  destination: string;
  summary?: string;
  estimated_total?: string;
  budget_breakdown?: {
    accommodation?: string;
    food?: string;
    transport?: string;
    activities?: string;
  };
  days: Day[];
}

const SharedItinerary = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [itinerary, setItinerary] = useState<ItineraryData | null>(null);
  const [meta, setMeta] = useState<{ destination: string; companion?: string; budget?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchItinerary = async () => {
      try {
        const { data, error } = await supabase
          .from("itineraries")
          .select("*")
          .eq("id", id!)
          .maybeSingle();

        if (error || !data) {
          setError(t('shared.missing_desc'));
          return;
        }

        setItinerary(data.itinerary_data as unknown as ItineraryData);
        setMeta({
          destination: data.destination,
          companion: data.companion ?? undefined,
          budget: data.budget ?? undefined,
        });
      } catch {
        setError(t('shared.loading_error') || "Failed to load itinerary.");
      } finally {
        setLoading(false);
      }
    };

    fetchItinerary();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">{t('shared.loading')}</p>
        </div>
      </div>
    );
  }

  if (error || !itinerary) {
    return (
      <div className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto max-w-3xl px-4">
          <div className="card-travel py-12 sm:py-16 text-center">
            <AlertTriangle className="mx-auto mb-4 h-10 w-10 sm:h-12 sm:w-12 text-secondary" />
            <h2 className="mb-2 font-display text-xl sm:text-2xl font-bold text-foreground">{t('shared.not_found')}</h2>
            <p className="mb-6 text-sm sm:text-base text-muted-foreground">{error || t('shared.missing_desc')}</p>
            <Button onClick={() => navigate("/planner")} className="btn-hero !px-5 !py-2.5 sm:!px-6 sm:!py-3 !text-sm">
              {t('shared.plan_own')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const destination = itinerary.destination || meta?.destination || t('shared.unnamed');
  const breakdown = itinerary.budget_breakdown;

  return (
    <div className="min-h-screen pt-20 sm:pt-24 pb-12 sm:pb-16">
      <div className="container mx-auto max-w-3xl px-3 sm:px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <button
            onClick={() => navigate(-1)}
            className="mb-4 sm:mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> {t('shared.back')}
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-6 sm:mb-8"
        >
          <span className="mb-1 inline-block text-xs sm:text-sm font-semibold uppercase tracking-wider text-primary">
            {t('shared.title')}
          </span>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground md:text-4xl">
            {destination}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {itinerary.days.length} {t('shared.days_prefix')} · {meta?.companion || t('shared.solo')} · ₹{meta?.budget || "N/A"} budget
          </p>
          {itinerary.summary && (
            <p className="mt-2 text-xs sm:text-sm text-muted-foreground italic">{itinerary.summary}</p>
          )}
        </motion.div>

        {/* Budget summary */}
        {(itinerary.estimated_total || breakdown) && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="card-travel mb-6 sm:mb-8 flex flex-wrap items-center gap-4 sm:gap-6 !p-4 sm:!p-6"
          >
            {itinerary.estimated_total && (
              <div>
                <p className="text-xs text-muted-foreground">{t('shared.est_total')}</p>
                <p className="text-base sm:text-lg font-bold text-foreground">{itinerary.estimated_total}</p>
              </div>
            )}
            {breakdown && (
              <>
                <div className="hidden sm:block h-8 w-px bg-border" />
                <div className="grid grid-cols-2 gap-3 sm:flex sm:gap-6 w-full sm:w-auto">
                  {breakdown.accommodation && (
                    <div>
                      <p className="text-xs text-muted-foreground">{t('shared.stay')}</p>
                      <p className="text-xs sm:text-sm font-semibold text-foreground">{breakdown.accommodation}</p>
                    </div>
                  )}
                  {breakdown.food && (
                    <div>
                      <p className="text-xs text-muted-foreground">{t('shared.food')}</p>
                      <p className="text-xs sm:text-sm font-semibold text-foreground">{breakdown.food}</p>
                    </div>
                  )}
                  {breakdown.transport && (
                    <div>
                      <p className="text-xs text-muted-foreground">{t('shared.transport')}</p>
                      <p className="text-xs sm:text-sm font-semibold text-foreground">{breakdown.transport}</p>
                    </div>
                  )}
                  {breakdown.activities && (
                    <div>
                      <p className="text-xs text-muted-foreground">{t('shared.activities')}</p>
                      <p className="text-xs sm:text-sm font-semibold text-foreground">{breakdown.activities}</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </motion.div>
        )}

        {/* Day-by-day (read-only for non-logged-in users) */}
        <div className="space-y-6 sm:space-y-8">
          {itinerary.days.map((day, di) => (
            <motion.div
              key={`${day.day}-${di}`}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 + di * 0.25 }}
            >
              <DaySection
                day={day}
                index={di}
                destination={destination}
                readOnly
                onUpdateActivity={() => {}}
                onDeleteActivity={() => {}}
                onAddActivity={() => {}}
              />
            </motion.div>
          ))}
        </div>

        {/* Reviews - visible to all, but submit requires login */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 + itinerary.days.length * 0.25 }}
        >
          <ReviewSection itineraryId={id} destination={destination} />
        </motion.div>
      </div>
    </div>
  );
};

export default SharedItinerary;
