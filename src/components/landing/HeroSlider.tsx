import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowRight, ChevronDown } from "lucide-react";

import tajmahalHero from "@/assets/destinations/tajmahal-hero.jpg";
import santoriniHero from "@/assets/destinations/santorini-hero.jpg";
import machupicchuHero from "@/assets/destinations/machupicchu-hero.jpg";
import saharaHero from "@/assets/destinations/sahara-hero.jpg";
import swissalpsHero from "@/assets/destinations/swissalps-hero.jpg";

const destinations = [
  {
    id: 1,
    region: "Uttar Pradesh · India",
    name: "TAJ MAHAL",
    desc: "A timeless monument of love and one of the Seven Wonders of the World, bathed in golden sunrise.",
    hero: "/trending/tajmahal.png",
  },
  {
    id: 2,
    region: "Cyclades · Greece",
    name: "SANTORINI",
    desc: "White-washed villages perched on volcanic cliffs overlooking the deep blue Aegean Sea.",
    hero: santoriniHero,
  },
  {
    id: 3,
    region: "Cusco · Peru",
    name: "MACHU PICCHU",
    desc: "The lost city of the Incas, hidden among misty Andean peaks and lush green terraces.",
    hero: machupicchuHero,
  },
  {
    id: 4,
    region: "Sahara · Morocco",
    name: "MARRAKECH MERZOUGA",
    desc: "Golden dunes stretching to the horizon, with camel caravans tracing ancient trade routes.",
    hero: saharaHero,
  },
  {
    id: 5,
    region: "Bernese Oberland · Switzerland",
    name: "SWISS ALPS",
    desc: "Majestic snow-capped peaks, crystal lakes, and wildflower meadows in the heart of Europe.",
    hero: swissalpsHero,
  },
];

const HeroSlider = () => {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  const goTo = useCallback(
    (index: number) => {
      setDirection(index > current ? 1 : -1);
      setCurrent(index);
    },
    [current]
  );

  const next = useCallback(() => {
    setDirection(1);
    setCurrent((p) => (p + 1) % destinations.length);
  }, []);

  const prev = useCallback(() => {
    setDirection(-1);
    setCurrent((p) => (p - 1 + destinations.length) % destinations.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(next, 4000);
    return () => clearInterval(timer);
  }, [next]);

  const active = destinations[current];
  const slideNumber = String(current + 1).padStart(2, "0");

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Background images */}
      <AnimatePresence mode="sync" custom={direction}>
        <motion.img
          key={active.id}
          src={active.hero}
          alt={active.name}
          width={1920}
          height={1080}
          className="absolute inset-0 h-full w-full object-cover"
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: "easeInOut" }}
        />
      </AnimatePresence>

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/30" />

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col justify-between px-6 pb-8 pt-24 md:px-12 lg:px-20">
        {/* Main content area */}
        <div className="flex flex-1 flex-col justify-center gap-8 lg:flex-row lg:items-end lg:justify-between">
          {/* Left: Destination info */}
          <div className="max-w-xl lg:mb-20">
            <AnimatePresence mode="wait">
              <motion.div
                key={active.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="mb-3 flex items-center gap-3">
                  <div className="h-[2px] w-8 bg-secondary" />
                  <span className="text-sm font-medium tracking-widest text-white/80 md:text-base">
                    {active.region}
                  </span>
                </div>

                <h1 className="mb-4 font-display text-5xl font-bold leading-[0.95] text-white sm:text-6xl md:text-7xl lg:text-8xl">
                  {active.name.split(" ").map((word, i) => (
                    <motion.span
                      key={word + i}
                      className="mr-[0.25em] inline-block"
                      initial={{ opacity: 0, x: -60 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 + i * 0.15, ease: "easeOut" }}
                    >
                      {word}
                    </motion.span>
                  ))}
                </h1>

                <p className="mb-6 max-w-md text-sm leading-relaxed text-white/70 md:text-base">
                  {active.desc}
                </p>

                <Link
                  to="/planner"
                  className="group inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20 md:text-base"
                >
                  Discover Location
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right: Destination cards */}
          <div className="flex gap-3 overflow-x-auto pb-4 lg:mb-20 lg:gap-4">
            {destinations.map((dest, i) => {
              const isActive = i === current;
              return (
                <motion.button
                  key={dest.id}
                  onClick={() => goTo(i)}
                  className={`group relative flex-shrink-0 overflow-hidden rounded-2xl transition-all duration-500 ${
                    isActive
                      ? "w-40 ring-2 ring-white/50 sm:w-44 md:w-48"
                      : "w-32 opacity-70 hover:opacity-100 sm:w-36 md:w-40"
                  }`}
                  style={{ height: isActive ? "220px" : "200px" }}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  <img
                    src={dest.hero}
                    alt={dest.name}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-white/60">
                      {dest.region}
                    </p>
                    <p className="font-display text-xs font-bold leading-tight text-white sm:text-sm">
                      {dest.name}
                    </p>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Bottom bar: navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={prev}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 text-white transition-colors hover:bg-white/10 md:h-12 md:w-12"
              aria-label="Previous destination"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={next}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 text-white transition-colors hover:bg-white/10 md:h-12 md:w-12"
              aria-label="Next destination"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* Progress bar */}
          <div className="mx-6 hidden flex-1 items-center gap-4 md:flex">
            <div className="h-[2px] flex-1 overflow-hidden rounded-full bg-white/20">
              <motion.div
                className="h-full rounded-full bg-secondary"
                initial={{ width: "0%" }}
                animate={{ width: `${((current + 1) / destinations.length) * 100}%` }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              />
            </div>
          </div>

          {/* Slide number */}
          <span className="font-display text-4xl font-bold text-white/40 md:text-5xl lg:text-6xl">
            {slideNumber}
          </span>
        </div>
      </div>

      {/* Scroll Down Indicator */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.8 }}
        className="absolute bottom-10 left-1/2 z-20 -translate-x-1/2"
      >
        <button
          onClick={() => window.scrollTo({ top: window.innerHeight, behavior: "smooth" })}
          className="group flex flex-col items-center gap-2 text-white/50 transition-colors hover:text-white"
          aria-label="Scroll down"
        >
          <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Scroll Down</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown className="h-6 w-6" />
          </motion.div>
        </button>
      </motion.div>
    </section>
  );
};

export default HeroSlider;
