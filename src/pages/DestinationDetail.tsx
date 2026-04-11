import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Sparkles, MapPin, Compass, Landmark, Info, ArrowRight, Loader2, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import SafeImage from "@/components/ui/SafeImage";
import { generateDestinationDetail } from "@/lib/ai";
import { toast } from "@/hooks/use-toast";
import { ALL_DESTINATIONS } from "@/data/destinations";

interface FamousPlace {
  name: string;
  description: string;
  speciality: string;
}

interface DestinationData {
  special_title: string;
  narrative: string;
  recommended_duration: string;
  peak_season: string;
  famous_places: FamousPlace[];
}

const DestinationDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DestinationData | null>(null);

  const passedDest = location.state?.destination;
  const staticDest = ALL_DESTINATIONS.find(d => d.id === id);
  const activeDest = passedDest || staticDest;
  const cityName = activeDest?.name || id?.replace(/-/g, " ");

  useEffect(() => {
    const fetchData = async () => {
      const apiKey = import.meta.env.VITE_GROQ_API_KEY;
      if (!apiKey) {
        toast({
          title: "API Key Missing",
          description: "VITE_GROQ_API_KEY not found in .env",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      try {
        const result = await generateDestinationDetail(apiKey, cityName);
        setData(result);
      } catch (error: any) {
        console.error("Failed to fetch destination details:", error);
        toast({
          title: "Analysis Failed",
          description: error.message || "Failed to analyze destination.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    window.scrollTo(0, 0);
  }, [cityName]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="relative mb-8">
          <motion.div
            animate={{ rotate: 360, scale: [1, 1.1, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="h-32 w-32 rounded-full border border-primary/20 border-t-primary shadow-[0_0_50px_rgba(var(--primary),0.3)]"
          />
          <Sparkles className="absolute inset-0 m-auto h-8 w-8 text-primary animate-pulse" />
        </div>
        <h2 className="text-3xl font-black text-white tracking-widest uppercase mb-2">Analyzing {cityName}</h2>
        <p className="text-primary font-medium tracking-[0.2em] italic uppercase">Consulting AI Travel Historians...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 overflow-x-hidden">
      {/* Hero Section */}
      <div className="relative h-[70vh] w-full overflow-hidden">
        <SafeImage
          src={activeDest?.image}
          alt={cityName}
          className="absolute inset-0 w-full h-full object-cover"
          query={`${cityName}, landmark`}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-background" />
        
        <div className="absolute top-28 left-0 right-0 z-10">
          <div className="container mx-auto px-6">
            <Link to="/trending" className="inline-flex items-center gap-2 text-white/80 font-bold text-sm bg-black/20 backdrop-blur-md px-4 py-2 rounded-full hover:bg-black/40 transition-all group">
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Back to Trends
            </Link>
          </div>
        </div>

        <div className="absolute bottom-12 left-0 right-0 z-10">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl bg-primary/20 backdrop-blur-md border border-primary/30 text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-4">
                <Sparkles className="h-3 w-3" /> AI Destination Insights
              </div>
              <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-none mb-4">
                {cityName}
              </h1>
              {data?.special_title && (
                <p className="text-2xl md:text-4xl font-display font-medium text-gradient italic tracking-tight">
                  {data.special_title}
                </p>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 mt-12 space-y-24">
        {/* Narrative Section */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                <Compass className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-black uppercase tracking-widest text-foreground">The Essence</h2>
            </div>
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed font-medium">
              {data?.narrative}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="card-travel p-8 space-y-6"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-secondary/10 text-secondary">
                <Info className="h-5 w-5" />
              </div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-secondary">Mission Readiness</p>
            </div>
            <div className="grid grid-cols-2 gap-8 text-center sm:text-left">
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Recommended Duration</p>
                <p className="text-white font-black text-xl tracking-tight">{data?.recommended_duration || "3-5 Days"}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Peak Season</p>
                <p className="text-white font-black text-xl tracking-tight">{data?.peak_season || "Oct - Mar"}</p>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Landmarks Section */}
        <section className="space-y-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                <Landmark className="h-6 w-6" />
              </div>
              <h2 className="text-3xl font-black uppercase tracking-tighter text-foreground">Famous Places to Visit</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {data?.famous_places.map((place, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group card-travel p-8 hover:shadow-primary/5 transition-all duration-500 hover:-translate-y-1"
              >
                <h3 className="text-xl font-black text-white mb-2 group-hover:text-primary transition-colors">{place.name}</h3>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{place.description}</p>
                <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-3 w-3 text-secondary" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-secondary">{place.speciality}</span>
                  </div>
                  <button
                    onClick={() => {
                      const query = encodeURIComponent(`${place.name}, ${cityName}`);
                      window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, "_blank");
                    }}
                    className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all transition-transform hover:scale-110 active:scale-95"
                    title="View on Google Maps"
                  >
                    <ArrowUpRight className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <motion.section
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative rounded-[3rem] overflow-hidden p-12 md:p-20 text-center"
        >
          <div className="absolute inset-0 bg-primary/10 backdrop-blur-xl border border-white/10" />
          <div className="relative z-10 space-y-8">
            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter">Ready to experience {cityName}?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our AI is ready to architect your perfect mission. Customized for your interests and budget.
            </p>
            <Button
              onClick={() => navigate("/planner", { state: { destination: cityName } })}
              className="btn-hero h-20 px-16 rounded-[2.5rem] text-2xl font-black shadow-2x-glow"
            >
              GENERATE MY PLAN <ArrowRight className="ml-3 h-8 w-8" />
            </Button>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default DestinationDetail;
