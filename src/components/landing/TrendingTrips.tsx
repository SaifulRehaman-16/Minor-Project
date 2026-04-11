import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Sparkles, ArrowUpRight, MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const trendingDestinations = [
  {
    id: 1,
    name: "Taj Mahal",
    location: "Agra, India",
    image: "https://images.unsplash.com/photo-1585506942812-e72b29cef752?q=80&w=1028&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    tag: "Cultural Heritage",
  },
  {
    id: 2,
    name: "Paris",
    location: "France",
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=2070&auto=format&fit=crop",
    tag: "Romantic Getaway",
  },
  {
    id: 3,
    name: "Kyoto",
    location: "Japan",
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=2070&auto=format&fit=crop",
    tag: "Zen Tradition",
  },
  {
    id: 4,
    name: "Tokyo",
    location: "Japan",
    image: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    tag: "Modern Vibrant",
  },
  {
    id: 5,
    name: "Goa",
    location: "India",
    image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=1974&auto=format&fit=crop",
    tag: "Beach Party",
  },
  {
    id: 6,
    name: "Alleppey",
    location: "Kerala, India",
    image: "https://images.unsplash.com/photo-1593693411515-c20261bcad6e?q=80&w=2069&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    tag: "Backwaters",
  },
  {
    id: 7,
    name: "Leh",
    location: "Ladakh, India",
    image: "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    tag: "High Altitude",
  },
  {
    id: 8,
    name: "Dubai",
    location: "UAE",
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=2070&auto=format&fit=crop",
    tag: "Luxury Desert",
  }
];

import { useNavigate } from "react-router-dom";
import SafeImage from "@/components/ui/SafeImage";

const TrendingTrips = () => {
  const { t } = useTranslation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const handlePlanClick = (dest: typeof trendingDestinations[0]) => {
    navigate("/planner", {
      state: {
        destination: dest.name,
        interests: [dest.tag.split(' ')[0]], // Take first word as interest
        people: "3",
        autoSubmit: true
      }
    });
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth / 2 : scrollLeft + clientWidth / 2;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-24 relative overflow-hidden bg-background">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-2"
          >
            <span className="text-secondary font-bold uppercase tracking-[0.2em] text-xs">{t('trending.explore')}</span>
            <h2 className="text-4xl md:text-5xl font-black text-foreground">
              {t('trending.title')}
            </h2>
          </motion.div>

          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => scroll('left')}
                className="rounded-full border-white/10 bg-white/5 backdrop-blur-md hover:bg-white/10 h-12 w-12"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => scroll('right')}
                className="rounded-full border-white/10 bg-white/5 backdrop-blur-md hover:bg-white/10 h-12 w-12"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
            <Link to="/planner" className="hidden md:block">
              <Button className="btn-hero h-12 px-6 rounded-full group">
                {t('trending.plan_yours')} <ArrowUpRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex overflow-x-auto gap-8 pb-12 scrollbar-hide snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {trendingDestinations.map((dest, i) => (
            <motion.div
              key={dest.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              onClick={() => handlePlanClick(dest)}
              className="flex-shrink-0 w-[85vw] md:w-[400px] snap-center group relative h-[500px] rounded-[2.5rem] overflow-hidden shadow-2xl hover:shadow-primary/20 transition-all duration-500 cursor-pointer"
            >
              <SafeImage
                src={dest.image}
                alt={dest.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                query={`${dest.name}, ${dest.location}`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

              <div className="absolute top-8 left-8 flex gap-2">
                <div className="px-4 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-[10px] font-bold text-white uppercase tracking-widest">
                  {dest.tag}
                </div>
              </div>

              <div className="absolute bottom-12 left-10 right-10">
                <div className="flex items-center gap-2 text-white/70 text-xs mb-3 font-semibold uppercase tracking-widest">
                  <MapPin className="h-3 w-3" />
                  <span>{dest.location}</span>
                </div>
                <h3 className="text-4xl font-bold text-white mb-6 group-hover:text-primary transition-colors">
                  {dest.name}
                </h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      {[1, 2, 3].map((_, idx) => (
                        <div key={idx} className="h-9 w-9 rounded-full border-2 border-black bg-muted flex items-center justify-center overflow-hidden">
                          <img src={`https://i.pravatar.cc/150?u=${dest.id + idx}`} alt="Avatar" className="h-full w-full object-cover" />
                        </div>
                      ))}
                    </div>
                    <span className="text-[10px] text-white/60 font-black uppercase tracking-wider">{t('trending.top_rated')}</span>
                  </div>
                  <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full bg-white/10 text-white hover:bg-primary hover:text-white transition-all">
                    <ArrowUpRight className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              <div className="absolute inset-0 border-2 border-white/0 group-hover:border-white/10 transition-all duration-500 rounded-[2.5rem] pointer-events-none" />
            </motion.div>
          ))}
          {/* Show All Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8 }}
            onClick={() => navigate("/trending")}
            className="flex-shrink-0 w-[85vw] md:w-[300px] snap-center group relative h-[500px] rounded-[2.5rem] overflow-hidden border-2 border-dashed border-primary/20 hover:border-primary/50 transition-all duration-500 cursor-pointer flex flex-col items-center justify-center gap-6 bg-primary/5"
          >
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-primary transition-all duration-500 shadow-glow">
              <ChevronRight className="h-10 w-10 text-primary group-hover:text-white" />
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-bold text-foreground">{t('trending.show_all')}</h3>
              <p className="text-xs text-muted-foreground font-medium mt-1">{t('trending.explore_ai')}</p>
            </div>
          </motion.div>

        </div>

        {/* Bottom Scroll Navigation Indicator */}
        <div className="mt-8 flex justify-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col items-center gap-4"
          >
            <Button
              variant="outline"
              onClick={() => scroll('right')}
              className="rounded-full border-white/10 bg-white/5 backdrop-blur-md hover:bg-primary/20 hover:border-primary/30 h-14 px-8 group transition-all duration-500"
            >
              <span className="text-xs font-black uppercase tracking-[0.3em] mr-4">{t('trending.scroll')}</span>
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/20 group-hover:bg-primary group-hover:scale-110 transition-all duration-500">
                <ChevronRight className="h-5 w-5 text-primary group-hover:text-white group-hover:translate-x-0.5 transition-all" />
              </div>
            </Button>

            {/* Minimalist Progress Indicator Dot Line */}
            <div className="flex gap-2 mt-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className={`h-1 rounded-full transition-all duration-500 ${i === 1 ? 'w-8 bg-primary shadow-glow' : 'w-2 bg-white/10'}`} />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default TrendingTrips;
