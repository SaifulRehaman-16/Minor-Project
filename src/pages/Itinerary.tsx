import { useState, useCallback, useMemo, useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, RefreshCw, Loader2, Sparkles, Share2, Check, Copy, Map as MapIcon, LayoutList, Share, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import DaySection from "@/components/itinerary/DaySection";
import ReviewSection from "@/components/itinerary/ReviewSection";
import GoogleItineraryMap from "@/components/itinerary/GoogleItineraryMap";
import { generateTravelItinerary } from "@/lib/ai";
import { geocodeDestination, fetchWeather, WeatherData } from "@/lib/weather";
import { format, differenceInDays, startOfDay } from "date-fns";

interface Activity {
  time: string;
  title: string;
  description: string;
  cost: string;
  type: "attraction" | "food" | "transport" | "hotel";
  image_url?: string;
  lat?: number;
  lng?: number;
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
  trip_title?: string;
  destination: string;
  summary?: string;
  estimated_total?: string;
  budget_breakdown?: {
    stay?: string;
    food?: string;
    transport?: string;
    activities?: string;
  };
  days: Day[];
}

const Itinerary = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [itinerary, setItinerary] = useState<ItineraryData | undefined>(location.state?.itinerary);
  const [savedId, setSavedId] = useState<string | undefined>(location.state?.savedId);
  const form = location.state?.form;
  const [regenerating, setRegenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [weatherLoading, setWeatherLoading] = useState(false);

  // Fail-safe: If someone visits /itinerary directly without a state, send them home
  useEffect(() => {
    if (!itinerary && !location.state?.itinerary) {
      console.log("No itinerary data found, redirecting home...");
      navigate("/", { replace: true });
    }
  }, [itinerary, navigate, location.state]);

  // Real-time weather integration
  useEffect(() => {
    const getLiveWeather = async () => {
      if (!itinerary?.destination) return;
      
      setWeatherLoading(true);
      try {
        const coords = await geocodeDestination(itinerary.destination);
        if (!coords) return;

        const forecast = await fetchWeather(coords.lat, coords.lng);
        if (!forecast) return;

        // Determine the start date of the trip
        const tripStart = form?.startDate ? startOfDay(new Date(form.startDate)) : startOfDay(new Date());
        const today = startOfDay(new Date());
        
        // Calculate the offset between trip start and today for forecast indexing
        const dayOffset = differenceInDays(tripStart, today);

        const updatedDays = itinerary.days.map((day, index) => {
          const forecastIndex = dayOffset + index;
          if (forecastIndex >= 0 && forecastIndex < forecast.length) {
            // Found a matching real-time forecast day!
            const realWeather = forecast[forecastIndex];
            return {
              ...day,
              weather: {
                ...realWeather,
                condition: `${realWeather.condition} (Live)`
              }
            };
          }
          return day;
        });

        setItinerary(prev => prev ? { ...prev, days: updatedDays } : prev);
      } catch (error) {
        console.error("Failed to integrate live weather:", error);
      } finally {
        setWeatherLoading(false);
      }
    };

    getLiveWeather();
  }, [itinerary?.destination]); // Run once when destination is confirmed

  const shareUrl = useMemo(() => {
    if (!savedId) return null;
    return `${window.location.origin}/itinerary/${savedId}`;
  }, [savedId]);

  const handleCopyLink = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: "Link Copied!", description: "Share it with your travel buddies." });
    } catch {
      toast({ title: "Failed to copy", variant: "destructive" });
    }
  };

  const persistItinerary = useCallback(async (updated: ItineraryData) => {
    if (!user || !savedId) return;
    try {
      const { error } = await supabase
        .from("itineraries")
        .update({
          itinerary_data: updated as any
        })
        .eq("id", savedId);
      
      if (error) throw error;
    } catch (e) {
      console.error("Failed to update itinerary:", e);
    }
  }, [user, savedId]);

  const handleUpdateActivity = (dayIndex: number, activityIndex: number, updated: Activity) => {
    if (!itinerary) return;
    const newItinerary = { ...itinerary, days: itinerary.days.map((d, di) => {
      if (di !== dayIndex) return d;
      return { ...d, activities: d.activities.map((a, ai) => ai === activityIndex ? updated : a) };
    })};
    setItinerary(newItinerary);
    persistItinerary(newItinerary);
    toast({ title: "Activity Updated", description: "Your changes have been saved." });
  };

  const handleDeleteActivity = (dayIndex: number, activityIndex: number) => {
    if (!itinerary) return;
    const newItinerary = { ...itinerary, days: itinerary.days.map((d, di) => {
      if (di !== dayIndex) return d;
      return { ...d, activities: d.activities.filter((_, ai) => ai !== activityIndex) };
    })};
    setItinerary(newItinerary);
    persistItinerary(newItinerary);
  };

  const handleAddActivity = (dayIndex: number) => {
    if (!itinerary) return;
    const newActivity: Activity = {
      time: "12:00 PM",
      title: "New Activity",
      description: "Click to edit details",
      cost: "Free",
      type: "attraction"
    };
    const newItinerary = { ...itinerary, days: itinerary.days.map((d, di) => {
      if (di !== dayIndex) return d;
      return { ...d, activities: [...d.activities, newActivity] };
    })};
    setItinerary(newItinerary);
    persistItinerary(newItinerary);
  };

  const handleRegenerate = async () => {
    const apiKey = import.meta.env.VITE_GROQ_API_KEY;
    if (!apiKey) {
      toast({ title: "API Key Missing", description: "Please add VITE_GROQ_API_KEY to your .env file.", variant: "destructive" });
      return;
    }

    setRegenerating(true);
    try {
      const prompt = `CRITICAL: You are an expert travel assistant. You MUST provide a jam-packed itinerary with 8-10 activities EVERY SINGLE DAY. 
Failure to provide at least 8 activities per day will result in a system error. 
Each day must include: Breakfast, Morning Sightseeing, Lunch, Afternoon Activity, Evening Relaxation, Dinner, and Nightlife/Rest.

Create a detailed day-by-day travel itinerary for a trip to ${form.destination} for ${form.days} days.
Starting from ${form.startPlace || "Home"}. Budget: ₹${form.budget}. 
Interests: ${form.interests && form.interests.length > 0 ? form.interests.join(", ") : "general sightseeing"}.

Respond ONLY with valid raw JSON following this exact structure (note the multiple activities):
{
  "trip_title": "String",
  "destination": "${form.destination}",
  "summary": "1-2 sentence overview",
  "estimated_total": "₹XXXXX",
  "budget_breakdown": { "stay": "₹XXXXX", "food": "₹XXXXX", "transport": "₹XXXXX", "activities": "₹XXXXX" },
  "days": [ 
    { 
      "day": 1, 
      "title": "Day Theme", 
      "weather": { "temperature": "XX°C", "condition": "Sunny", "icon": "☀️" }, 
      "activities": [ 
        { "time": "08:00 AM", "title": "Breakfast at X", "description": "...", "cost": "₹XXX", "type": "food", "lat": 0, "lng": 0 },
        { "time": "10:00 AM", "title": "Visit Y", "description": "...", "cost": "₹XXX", "type": "attraction", "lat": 0, "lng": 0 }
      ] 
    } 
  ]
}
Do not include markdown. PROVIDE 8-10 ACTIVITIES PER DAY. PROVIDE REAL COORDINATES.`;

      const data = await generateTravelItinerary(apiKey, prompt);
      if (!data) throw new Error("Neural generation failed.");

      if (user && savedId) {
        await supabase.from("itineraries").update({ itinerary_data: data as any }).eq("id", savedId);
      }
      setItinerary(data);
      toast({ title: "Itinerary Re-imagined", description: "A fresh perspective on your journey has been generated." });
    } catch (err: any) {
      toast({ title: "Generation Failed", description: err.message, variant: "destructive" });
    } finally {
      setRegenerating(false);
    }
  };

  if (!itinerary) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="loader-orbit" />
        <p className="mt-8 font-display text-sm font-medium animate-pulse text-muted-foreground tracking-widest uppercase">Initializing Neural Architect...</p>
      </div>
    );
  }

  const destination = itinerary.destination || form?.destination || "Your Destination";
  const breakdown = itinerary.budget_breakdown;

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30 selection:text-primary overflow-hidden">
      <div className="flex h-screen relative">
        
        {/* Left Side: Scrollable Itinerary */}
        <div className={`transition-all duration-700 h-full overflow-y-auto custom-scrollbar ${isMapOpen ? 'w-full lg:w-[45%]' : 'w-full max-w-4xl mx-auto px-4 py-8 sm:py-12'}`}>
          <div className={`px-4 py-6 ${isMapOpen ? 'sm:px-6' : ''}`}>
            {/* Nav */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <Button variant="ghost" asChild className="w-fit -ml-2 text-muted-foreground hover:text-foreground">
                <Link to="/planner">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to Planner
                </Link>
              </Button>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsMapOpen(!isMapOpen)}
                  className={`rounded-xl border-white/10 bg-white/5 hover:bg-primary/20 transition-all ${isMapOpen ? 'text-primary border-primary/30 bg-primary/10' : ''}`}
                >
                  {isMapOpen ? <LayoutList className="h-4 w-4 mr-2" /> : <MapIcon className="h-4 w-4 mr-2" />}
                  {isMapOpen ? <span className="hidden sm:inline">List View</span> : <span className="hidden sm:inline">Interactive Map</span>}
                  {!isMapOpen && <span className="sm:hidden text-[10px] uppercase tracking-widest">Map</span>}
                </Button>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="rounded-xl border-white/10 bg-white/5 hover:bg-white/10">
                      <Share2 className="h-4 w-4 mr-2" /> <span className="hidden sm:inline">Share</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-4 card-travel border-white/10" align="end">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <h4 className="font-display font-medium leading-none">Share Itinerary</h4>
                        <p className="text-sm text-muted-foreground">Give your friends access to this trip.</p>
                      </div>
                      <div className="flex gap-2">
                        <input readOnly value={shareUrl || "Login to share..."} className="flex-1 rounded-lg bg-black/40 border border-white/10 px-3 py-1.5 text-xs" />
                        <Button size="sm" onClick={handleCopyLink} disabled={!shareUrl} className="btn-hero h-auto px-3 py-1.5">
                          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-8">
              <span className="mb-1 inline-block text-xs font-semibold uppercase tracking-widest text-primary/80">
                Mission Plan
              </span>
              <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                {itinerary.trip_title || destination}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {itinerary.days.length} days · {form?.companion || "Solo"} · {itinerary.estimated_total || `₹${form?.budget || "50,000"} budget`}
              </p>
              {itinerary.summary && <p className="mt-4 text-sm text-muted-foreground leading-relaxed italic border-l-2 border-primary/30 pl-4">{itinerary.summary}</p>}
            </motion.div>

            {/* Budget Breakdown */}
            {breakdown && Object.keys(breakdown).length > 0 && (
               <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="card-travel mb-10 flex flex-wrap items-center gap-6 !p-6 border-white/5 bg-white/5 backdrop-blur-md">
                  {Object.entries(breakdown).map(([key, value], i) => (
                    <div key={key} className="flex flex-col">
                      <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mb-1">{key}</span>
                      <span className="text-sm font-display font-bold text-foreground">{value as string}</span>
                    </div>
                  ))}
               </motion.div>
            )}

            {/* Day List */}
            <div className="space-y-12">
              {itinerary.days.map((day, di) => (
                <div key={di} className={`transition-all duration-300 ${isMapOpen && activeDayIndex === di ? 'ring-2 ring-primary/40 rounded-2xl p-2 -m-2 bg-primary/5' : ''}`}>
                  <DaySection
                    day={day}
                    index={di}
                    destination={destination}
                    isViewingOnMap={isMapOpen && activeDayIndex === di}
                    onShowOnMap={() => {
                      setActiveDayIndex(di);
                      setIsMapOpen(true);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    onUpdateActivity={(ai, updated) => handleUpdateActivity(di, ai, updated)}
                    onDeleteActivity={(ai) => handleDeleteActivity(di, ai)}
                    onAddActivity={() => handleAddActivity(di)}
                  />
                </div>
              ))}
            </div>

            {/* Footer Buttons */}
            <div className="mt-16 text-center space-y-6">
              <Sparkles className="h-8 w-8 text-secondary mx-auto" />
              <div className="space-y-2">
                <h3 className="font-display text-lg font-bold">Optimization Complete</h3>
                <p className="text-sm text-muted-foreground">Adjust activities as needed or regenerate for a new perspective.</p>
              </div>
              <Button onClick={handleRegenerate} disabled={regenerating} className="btn-hero !px-10">
                {regenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                {regenerating ? "Neural Recalibration..." : "Regenerate Mission"}
              </Button>
            </div>
            
            <div className="mt-12 py-10 border-t border-white/5">
               <ReviewSection itineraryId={savedId} destination={destination} />
            </div>
          </div>
        </div>

        {/* Right Side: Interactive Map */}
        <AnimatePresence>
          {isMapOpen && (
            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 120 }}
              className="hidden lg:block w-[55%] h-full border-l border-white/10 bg-background relative"
            >
              <div className="absolute top-6 left-6 z-[1000] flex items-center gap-2">
                 <div className="bg-background/80 backdrop-blur-md border border-white/10 rounded-xl px-4 py-2 flex items-center gap-3 shadow-2xl">
                    <div className="bg-primary h-6 w-6 rounded-lg flex items-center justify-center text-[10px] font-bold">D{activeDayIndex + 1}</div>
                    <div className="text-xs font-bold uppercase tracking-widest">{itinerary.days[activeDayIndex].title || `Day ${activeDayIndex + 1}`}</div>
                 </div>
                 
                 <div className="flex bg-background/80 backdrop-blur-md border border-white/10 rounded-xl p-1 shadow-2xl">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      onClick={() => setActiveDayIndex(prev => Math.max(0, prev - 1))}
                      disabled={activeDayIndex === 0}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      onClick={() => setActiveDayIndex(prev => Math.min(itinerary.days.length - 1, prev + 1))}
                      disabled={activeDayIndex === itinerary.days.length - 1}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                 </div>
              </div>
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute top-6 right-6 z-[1000] h-10 w-10 border border-white/10 bg-background/80 backdrop-blur-md rounded-full shadow-2xl text-muted-foreground hover:text-foreground"
                onClick={() => setIsMapOpen(false)}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>

              <GoogleItineraryMap 
                activities={itinerary.days[activeDayIndex].activities} 
                destination={destination} 
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Itinerary;
