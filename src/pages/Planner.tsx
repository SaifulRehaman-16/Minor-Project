import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Calendar as CalendarIcon, Wallet, Heart, Users, Sparkles, Loader2, Plus, X, ArrowRight, Plane, Briefcase, Map, Globe, Shield, ChevronRight, Zap } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import LocationAutocomplete from "@/components/LocationAutocomplete";
import { generateTravelItinerary } from "@/lib/ai";

const interestOptions = ["NATURE", "FOOD", "CULTURE", "ADVENTURE", "NIGHTLIFE", "SHOPPING", "HISTORY", "RELAXATION"];
const companions = [
  { id: "Solo", label: "Solo", icon: <Users className="h-4 w-4" /> },
  { id: "Couple", label: "Couple", icon: <Heart className="h-4 w-4" /> },
  { id: "Friends", label: "Friends", icon: <Globe className="h-4 w-4" /> },
  { id: "Family", label: "Family", icon: <Shield className="h-4 w-4" /> },
];

const MIN_BUDGET_PER_PERSON_PER_DAY = 1500;

const Planner = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [form, setForm] = useState({
    startPlace: "",
    destination: "",
    days: "5",
    budget: "50000",
    people: "1",
    startDate: undefined as Date | undefined,
    interests: [] as string[],
    companion: "Solo",
  });
  const [customInterest, setCustomInterest] = useState("");
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const loadingMessages = [
    "Optimizing the route...",
    "Making our plan ready...",
    "Checking local weather patterns...",
    "Curating hidden gems...",
    "Neural engine at 98%...",
    "Finalizing your escape architecture...",
    "Polishing the itinerary..."
  ];

  useEffect(() => {
    let interval: any;
    if (loading) {
      interval = setInterval(() => {
        setLoadingMessageIndex((prev) => (prev + 1) % loadingMessages.length);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [loading]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("interests")
          .eq("user_id", user.id)
          .maybeSingle();
        
        if (!error && data?.interests) {
          setForm(prev => ({
            ...prev,
            interests: [...new Set([...prev.interests, ...data.interests.map((i: string) => i.toUpperCase())])]
          }));
        }
      } catch (err) {
        console.error("Failed to fetch user profile for planner:", err);
      }
    };

    fetchUserProfile();

    const state = location.state as any;
    if (state) {
      setForm(prev => ({
        ...prev,
        destination: state.destination || prev.destination,
        interests: state.interests ? [...new Set([...prev.interests, ...state.interests.map((i: string) => i.toUpperCase())])] : prev.interests,
        people: state.people || prev.people,
      }));
    }
  }, [location.state, user]);

  const toggleInterest = (interest: string) => {
    const canonical = interest.toUpperCase();
    setForm((f) => ({
      ...f,
      interests: f.interests.includes(canonical)
        ? f.interests.filter((i) => i !== canonical)
        : [...f.interests, canonical],
    }));
  };

  const addCustomInterest = () => {
    const trimmed = customInterest.trim().toUpperCase();
    if (trimmed && !form.interests.includes(trimmed)) {
      setForm((f) => ({
        ...f,
        interests: [...f.interests, trimmed],
      }));
      setCustomInterest("");
      setIsAddingCustom(false);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!form.destination) {
      toast({ title: "Wait!", description: "Where are we flying to?", variant: "destructive" });
      return;
    }

    const days = parseInt(form.days);
    const people = parseInt(form.people);
    const budget = parseInt(form.budget);
    const minBudget = days * people * MIN_BUDGET_PER_PERSON_PER_DAY;

    if (budget < minBudget) {
      toast({
        title: "Budget Adjustment Recommended",
        description: `For a trip like this, we suggest min. ₹${minBudget.toLocaleString("en-IN")}.`,
        variant: "destructive",
      });
      return;
    }

    if (loading) return;
    setLoading(true);

    try {
      /* Temporarily disabled cache to ensure fresh high-density generation
      if (user) {
        ... (cache logic) ...
      }
      */

      const apiKey = import.meta.env.VITE_GROQ_API_KEY;
      if (!apiKey) throw new Error("Groq API Key not found. Please add VITE_GROQ_API_KEY to your .env file.");

      const prompt = `CRITICAL: You are an expert travel assistant. You MUST provide a jam-packed itinerary with 8-10 activities EVERY SINGLE DAY. 
Failure to provide at least 8 activities per day will result in a system error. 
Each day must include: Breakfast, Morning Sightseeing, Lunch, Afternoon Activity, Evening Relaxation, Dinner, and Nightlife/Rest.

Create a detailed day-by-day travel itinerary for a trip to ${form.destination} for ${form.days} days.
Traveler starting from: ${form.startPlace || "Home"}
Budget: ₹${form.budget}
Interests: ${form.interests?.join(", ") || "Everything"}
Companions: ${form.companion}

Respond ONLY with valid raw JSON following this exact structure (note the multiple activities):
{
  "trip_title": "string",
  "destination": "string",
  "summary": "overview",
  "estimated_total": "₹XXXXX",
  "budget_breakdown": { "stay": "₹XXXXX", "food": "₹XXXXX", "transport": "₹XXXXX", "activities": "₹XXXXX" },
  "days": [
    {
      "day": 1,
      "title": "Theme",
      "weather": { "temperature": "XX°C", "condition": "Sunny", "icon": "☀️" },
      "activities": [
        { "time": "08:00 AM", "title": "Breakfast at X", "description": "...", "cost": "₹XXX", "type": "food", "lat": 0, "lng": 0 },
        { "time": "10:00 AM", "title": "Visit Y", "description": "...", "cost": "₹XXX", "type": "attraction", "lat": 0, "lng": 0 }
      ]
    }
  ]
}
Do not include any markdown formatting. PROVIDE 8-10 ACTIVITIES PER DAY. PROVIDE REAL COORDINATES.`;

      const data = await generateTravelItinerary(apiKey, prompt);

      if (!data) throw new Error("Neural generation failed. Please try again.");
      
      let savedId: string | undefined;
      if (user) {
        const { data: savedData, error: saveError } = await supabase
          .from("itineraries")
          .insert({
            user_id: user.id,
            destination: form.destination,
            start_place: form.startPlace,
            days: parseInt(form.days),
            budget: form.budget,
            interests: form.interests,
            companion: form.companion,
            start_date: form.startDate ? format(form.startDate, "yyyy-MM-dd") : null,
            itinerary_data: data,
          })
          .select().single();

        if (!saveError) savedId = savedData.id;
      }

      navigate("/itinerary", { state: { itinerary: data, form, savedId } });
    } catch (err: any) {
      toast({ 
        title: "Communication Error", 
        description: err.message || "We encountered a glitch in the neural network.", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#050505] selection:bg-primary/40 selection:text-white pb-32">
      {/* Immersive Cinematic Background */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 scale-105"
        style={{ backgroundImage: `url('/planner-hero-cinematic.png')` }}
      >
        <div className="absolute inset-0 bg-black/70 backdrop-blur-[4px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/60" />
      </div>

      <div className="container relative z-10 mx-auto max-w-7xl px-4 pt-24 lg:pt-32">
        
        {/* Header Branding */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mb-12"
        >
          <h1 className="text-5xl lg:text-7xl font-black text-white tracking-tighter mb-4 leading-[0.9] drop-shadow-2xl uppercase whitespace-nowrap">
            PLAN YOUR <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-primary animate-gradient-x">ESCAPE</span>
          </h1>
          <p className="text-white/80 text-xl font-medium max-w-2xl mx-auto leading-relaxed drop-shadow-lg">
            Your journey starts here. Choose your coordinates, define the parameters, and let our engine handle the architecture.
          </p>
        </motion.div>

        {/* Bento Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Widget 1: Route Panel (Span 8) */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-8 glass-panel-heavy p-8 flex flex-col justify-center gap-8 relative overflow-hidden group border-white/10 bg-black/40 backdrop-blur-3xl"
          >
            <div className="absolute inset-0 flex items-center justify-center opacity-5 group-hover:opacity-10 pointer-events-none transition-opacity overflow-hidden">
              <Plane className="h-48 w-48 -rotate-45" />
            </div>
            
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10 w-full max-w-4xl mx-auto px-4">
              
              {/* Origin Section */}
              <div className="flex-1 w-full space-y-4 text-center md:text-left">
                <div className="flex items-center gap-2 mb-1 justify-center md:justify-start">
                  <MapPin className="h-4 w-4 text-primary" />
                  <Label className="text-[12px] font-black uppercase text-white/70 tracking-[0.2em]">Origin</Label>
                </div>
                <div className="relative max-w-sm mx-auto md:mx-0">
                  <LocationAutocomplete
                    placeholder="Depart from..."
                    value={form.startPlace}
                    onChange={(v) => setForm({ ...form, startPlace: v })}
                    showIcon={false}
                    inputClassName="bg-white/10 border-white/20 h-16 text-xl rounded-2xl focus:bg-white/10 focus:border-primary/50 transition-all font-bold pl-6 text-white placeholder:text-white/20"
                    className="p-0 border-none bg-transparent h-auto"
                  />
                </div>
              </div>

              {/* Connecting Arrow */}
              <div className="shrink-0 flex flex-col items-center justify-center pt-8">
                <div className="h-10 w-10 rounded-full border border-white/20 flex items-center justify-center bg-white/10 shadow-glow shadow-primary/10">
                  <ArrowRight className="h-5 w-5 text-primary" />
                </div>
                <div className="h-px w-20 bg-gradient-to-r from-primary/50 via-secondary/50 to-primary/50 mt-4 opacity-30 hidden md:block" />
              </div>

              {/* Destination Section */}
              <div className="flex-1 w-full space-y-4 text-center md:text-right">
                <div className="flex items-center gap-2 justify-center md:justify-end mb-1">
                  <Label className="text-[12px] font-black uppercase text-white/70 tracking-[0.2em]">Destination</Label>
                  <Plane className="h-4 w-4 text-secondary" />
                </div>
                <div className="relative max-w-sm mx-auto md:ml-auto">
                  <LocationAutocomplete
                    placeholder="Where to?"
                    value={form.destination}
                    onChange={(v) => setForm({ ...form, destination: v })}
                    showIcon={false}
                    inputClassName="bg-white/10 border-white/20 h-16 text-xl rounded-2xl focus:bg-white/10 focus:border-secondary/50 transition-all font-bold pl-6 text-white placeholder:text-white/20 text-right pr-6"
                    className="p-0 border-none bg-transparent h-auto"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Widget 2: Tempo Panel (Span 4) */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-4 glass-panel-heavy p-8 flex flex-col gap-8 border-white/10 bg-black/40 backdrop-blur-3xl"
          >
            <div className="space-y-4">
              <Label className="text-[12px] font-black uppercase text-primary tracking-[0.2em] block">Trip Tempo</Label>
              <div className="flex items-center gap-6 bg-white/10 p-4 rounded-[2rem] border border-white/20 h-24">
                <button 
                  onClick={() => setForm(p => ({ ...p, days: Math.max(1, parseInt(p.days) - 1).toString() }))}
                  className="h-12 w-12 rounded-full hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-colors"
                >
                  <Plus className="h-6 w-6 rotate-45" />
                </button>
                <div className="flex-1 text-center">
                  <span className="text-5xl font-black text-white leading-none block">{form.days}</span>
                  <span className="text-[12px] uppercase font-bold text-white/60 tracking-widest">Days</span>
                </div>
                <button 
                  onClick={() => setForm(p => ({ ...p, days: Math.min(30, parseInt(p.days) + 1).toString() }))}
                  className="h-12 w-12 rounded-full hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-colors"
                >
                  <Plus className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-[12px] font-black uppercase text-secondary tracking-[0.2em] block">Departure</Label>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <button className="w-full h-16 rounded-[2rem] bg-white/10 border border-white/20 flex items-center px-6 gap-4 hover:bg-white/20 transition-all font-bold text-white">
                    <CalendarIcon className="h-5 w-5 text-secondary" />
                    {form.startDate ? format(form.startDate, "MMM dd, yyyy") : "Select Date"}
                    <ChevronRight className="ml-auto h-4 w-4 opacity-50" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 border-white/20 bg-black/95 backdrop-blur-3xl">
                  <Calendar 
                    mode="single" 
                    selected={form.startDate} 
                    disabled={{ before: new Date() }}
                    onSelect={(d) => {
                      setForm({ ...form, startDate: d });
                      setCalendarOpen(false);
                    }} 
                  />
                </PopoverContent>
              </Popover>
            </div>
          </motion.div>

          {/* Widget 3: Manifest (Span 5) */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-5 glass-panel-heavy p-8 flex flex-col gap-8 border-white/10 bg-black/40 backdrop-blur-3xl"
          >
            <div className="space-y-4">
              <Label className="text-[12px] font-black uppercase text-primary tracking-[0.2em] block">Traveling Manifest</Label>
              <div className="grid grid-cols-4 gap-3">
                {companions.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setForm({ ...form, companion: c.id })}
                    className={cn(
                      "flex flex-col items-center justify-center py-4 rounded-2xl border transition-all duration-300 gap-2",
                      form.companion === c.id 
                        ? "bg-primary/30 border-primary text-white shadow-glow" 
                        : "bg-white/5 border-white/20 text-white/60 hover:border-white/40"
                    )}
                  >
                    {c.icon}
                    <span className="text-[10px] font-black uppercase tracking-tight">{c.id}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-[12px] font-black uppercase text-secondary tracking-[0.2em] block">Passenger Count</Label>
              <div className="flex items-center gap-6 bg-white/10 p-4 rounded-[2rem] border border-white/20 h-24">
                <button 
                  onClick={() => setForm(p => ({ ...p, people: Math.max(1, parseInt(p.people) - 1).toString() }))}
                  className="h-12 w-12 rounded-full hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-colors"
                >
                  <Plus className="h-6 w-6 rotate-45" />
                </button>
                <div className="flex-1 text-center">
                  <span className="text-5xl font-black text-white leading-none block">{form.people}</span>
                  <span className="text-[12px] uppercase font-bold text-white/60 tracking-widest">Travelers</span>
                </div>
                <button 
                  onClick={() => setForm(p => ({ ...p, people: Math.min(20, parseInt(p.people) + 1).toString() }))}
                  className="h-12 w-12 rounded-full hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-all"
                >
                  <Plus className="h-6 w-6" />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Widget 4: DNA Grid (Span 7) */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-7 glass-panel-heavy p-8 flex flex-col gap-6 border-white/10 bg-black/40 backdrop-blur-3xl"
          >
            <div className="flex items-center justify-between">
              <Label className="text-[12px] font-black uppercase text-primary tracking-[0.2em]">Travel DNA</Label>
              <div className="h-1 flex-1 mx-4 bg-white/10 rounded-full relative overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(form.interests.length / 8) * 100}%` }}
                  className="absolute h-full bg-primary shadow-glow transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col gap-6">
              {/* Selected Interests Row */}
              <AnimatePresence>
                {form.interests.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex flex-wrap gap-2 pb-4 border-b border-white/5"
                  >
                    {form.interests.map((int) => (
                      <button
                        key={int}
                        onClick={() => toggleInterest(int)}
                        className="px-4 py-2 rounded-xl text-[12px] font-black uppercase tracking-widest bg-secondary/30 border border-secondary text-white shadow-soft flex items-center gap-2 group transition-all hover:bg-secondary/40"
                      >
                        {int}
                        <X className="h-3 w-3 text-secondary group-hover:text-white" />
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Available Pool (Unselected) */}
              <div className="flex flex-wrap gap-2">
                {interestOptions
                  .filter(int => !form.interests.includes(int))
                  .length > 0 && interestOptions
                    .filter(int => !form.interests.includes(int))
                    .map((int) => (
                      <button
                        key={int}
                        onClick={() => toggleInterest(int)}
                        className="px-4 py-2 rounded-xl text-[12px] font-black uppercase tracking-widest border border-white/10 bg-white/5 text-white/40 hover:border-white/30 hover:bg-white/10 transition-all duration-300"
                      >
                        {int}
                      </button>
                    ))}
                
                <AnimatePresence mode="wait">
                  {isAddingCustom ? (
                    <motion.div initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: "auto" }} className="flex items-center gap-2 bg-white/5 rounded-xl border border-white/20 p-1">
                      <input autoFocus value={customInterest} onChange={e => setCustomInterest(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCustomInterest()} className="bg-transparent border-none text-[10px] uppercase font-black tracking-widest w-20 px-2 text-white outline-none" placeholder="..." />
                      <Button size="icon" variant="ghost" className="h-6 w-6" onClick={addCustomInterest}><Plus className="h-3 w-3" /></Button>
                    </motion.div>
                  ) : (
                    <button onClick={() => setIsAddingCustom(true)} className="px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border border-dashed border-primary/40 text-primary hover:bg-primary/5 transition-all">
                      + Add Other
                    </button>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

          {/* Widget 5: Treasury (Span 12) */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-12 glass-panel-heavy p-10 border-white/10 bg-black/40 backdrop-blur-3xl"
          >
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="flex-1 w-full space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <Wallet className="h-5 w-5 text-primary" />
                  <Label className="text-[12px] font-black uppercase text-primary tracking-[0.2em]">Mission Budget (₹)</Label>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-7xl font-black text-white tracking-tighter drop-shadow-lg">
                    ₹{parseInt(form.budget).toLocaleString("en-IN")}
                  </span>
                  <span className="text-white/60 font-bold tracking-widest text-[12px] uppercase">INR Total</span>
                </div>
                <input 
                  type="range"
                  min="5000"
                  max="500000"
                  step="1000"
                  value={form.budget}
                  onChange={(e) => setForm({ ...form, budget: e.target.value })}
                  className="w-full accent-primary h-2 bg-white/20 rounded-full appearance-none cursor-pointer hover:bg-white/30 transition-all outline-none shadow-inner"
                />
              </div>

              <div className="w-px h-24 bg-white/20 hidden md:block" />

              <div className="flex flex-col gap-4 w-full md:w-auto">
                {/* Protocol section removed as requested */}
              </div>
            </div>
          </motion.div>

        </div>

        {/* Global Action Footer */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-16 flex flex-col items-center gap-8"
        >
          <Button
            onClick={() => handleSubmit()}
            disabled={loading || !form.destination}
            className="btn-hero h-20 px-16 rounded-[2.5rem] text-2xl font-black shadow-2x-glow relative overflow-hidden group border-none"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-primary animate-gradient-x opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10 flex items-center gap-4">
              {loading ? (
                <>
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span>CRAFTING...</span>
                </>
              ) : (
                <>
                  <span>GENERATE PLAN</span>
                </>
              )}
            </div>
          </Button>
          
          <div className="flex items-center gap-8 text-[10px] font-black uppercase tracking-[0.4em] text-white/20">
            <div className="h-px w-20 bg-white/5" />
            <span>Encrypted AI Architect</span>
            <div className="h-px w-20 bg-white/5" />
          </div>
        </motion.div>
      </div>

      {/* Global Neural Loading Interface */}
      <AnimatePresence>
        {loading && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-3xl flex items-center justify-center pointer-events-none"
          >
            <div className="flex flex-col items-center gap-12 text-center p-8">
              <div className="relative">
                <motion.div 
                  animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="h-48 w-48 rounded-full border border-primary/20 border-t-primary shadow-[0_0_100px_rgba(30,174,152,0.4)]"
                />
                <div className="absolute inset-0 m-auto h-24 w-24 rounded-full bg-primary/20 blur-2xl animate-pulse" />
                <Sparkles className="absolute inset-0 m-auto h-12 w-12 text-primary" />
              </div>
              <div className="space-y-6">
                <h2 className="text-5xl font-black text-white tracking-widest uppercase mb-2">Generating your plan</h2>
                <h3 className="text-2xl font-medium text-primary tracking-[0.2em] italic uppercase min-h-[1.5em] transition-all duration-500">
                  {loadingMessages[loadingMessageIndex]}
                </h3>
                <div className="flex items-center justify-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <motion.div 
                      key={i}
                      animate={{ height: [4, 24, 4] }}
                      transition={{ duration: 1, repeat: Infinity, delay: i * 0.1 }}
                      className="w-1 bg-primary/50 rounded-full"
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Planner;
