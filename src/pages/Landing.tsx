import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, MapPin, Calendar, Wallet, Users, Star, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import HeroSlider from "@/components/landing/HeroSlider";
import NamasteGreeting from "@/components/landing/NamasteGreeting";
import TrendingTrips from "@/components/landing/TrendingTrips";
import { Button } from "@/components/ui/button";
import { useTranslation, Trans } from "react-i18next";

const features = [
  { icon: Sparkles, titleKey: "features.f1_title", descKey: "features.f1_desc" },
  { icon: MapPin, titleKey: "features.f2_title", descKey: "features.f2_desc" },
  { icon: Calendar, titleKey: "features.f3_title", descKey: "features.f3_desc" },
  { icon: Wallet, titleKey: "features.f4_title", descKey: "features.f4_desc" },
  { icon: Users, titleKey: "features.f5_title", descKey: "features.f5_desc" },
  { icon: Star, titleKey: "features.f6_title", descKey: "features.f6_desc" },
];



const fade = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

const Landing = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Hero Slider */}
      <HeroSlider />

      {/* Personalized Greeting */}
      <NamasteGreeting />

      {/* Trending Destinations */}
      <TrendingTrips />

      {/* Features */}
      <section id="features" className="py-24 relative">
        {/* Background Mesh Gradient */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_20%,rgba(37,99,235,0.05),transparent_40%),radial-gradient(circle_at_80%_80%,rgba(217,119,6,0.05),transparent_40%)]" />
        
        <div className="container mx-auto px-6 relative z-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} className="mb-14 text-center">
            <motion.span variants={fade} custom={0} className="mb-2 inline-block text-sm font-semibold uppercase tracking-widest text-primary">{t('hero.why_explorer')}</motion.span>
            <motion.h2 variants={fade} custom={1} className="font-display text-4xl font-black text-foreground md:text-6xl">
              <Trans i18nKey="hero.features_title">
                Travel <span className="text-gradient">Smarter</span>, Not Harder
              </Trans>
            </motion.h2>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <motion.div 
                key={f.titleKey} 
                variants={fade} 
                custom={i} 
                className="glass-panel p-10 group transition-all duration-500 hover:-translate-y-3 hover:shadow-glow relative overflow-hidden bg-white/5 border-white/10 h-full flex flex-col items-center text-center"
              >
                <div className="absolute -inset-px bg-gradient-to-br from-primary/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 transition-all duration-500 group-hover:bg-primary group-hover:rotate-12 group-hover:scale-110 shadow-soft">
                    <f.icon className="h-10 w-10 text-primary transition-colors group-hover:text-primary-foreground" />
                  </div>
                  <h3 className="mb-4 font-display text-2xl font-bold text-foreground group-hover:text-primary transition-colors">{t(f.titleKey)}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground font-medium">{t(f.descKey)}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 bg-gradient-to-b from-background via-card/10 to-background relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-secondary/5 rounded-full blur-[150px] -z-10 pointer-events-none" />
        <div className="container mx-auto px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="mb-14 text-center">
            <motion.span variants={fade} custom={0} className="mb-2 inline-block text-sm font-semibold uppercase tracking-widest text-primary">{t('steps.process')}</motion.span>
            <motion.h2 variants={fade} custom={1} className="font-display text-4xl font-black text-foreground md:text-6xl">
              <Trans i18nKey="hero.steps_title">
                Plan in <span className="text-gradient">3 Easy Steps</span>
              </Trans>
            </motion.h2>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid gap-12 md:grid-cols-3">
            {[
              { step: "01", titleKey: "steps.s1_title", descKey: "steps.s1_desc" },
              { step: "02", titleKey: "steps.s2_title", descKey: "steps.s2_desc" },
              { step: "03", titleKey: "steps.s3_title", descKey: "steps.s3_desc" },
            ].map((s, i) => (
              <motion.div 
                key={s.step} 
                variants={fade} 
                custom={i} 
                className="text-center group relative p-6"
              >
                <div className="mx-auto mb-10 flex h-24 w-24 items-center justify-center rounded-[2.5rem] bg-white/5 border border-white/10 font-display text-4xl font-black text-primary/40 transition-all duration-700 group-hover:bg-primary group-hover:text-primary-foreground group-hover:rotate-[360deg] shadow-elevated">
                  {s.step}
                </div>
                <h3 className="mb-4 font-display text-2xl font-bold text-foreground group-hover:text-primary transition-colors">{t(s.titleKey)}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed font-medium mx-auto max-w-xs">{t(s.descKey)}</p>
                {i < 2 && (
                  <div className="hidden lg:block absolute top-1/2 -right-6 w-12 h-px bg-white/10" />
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>



      {/* Final CTA */}
      <section className="py-32 relative group">
        <div className="container mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-[3rem] bg-[#0A0A0A] px-8 py-24 text-center border border-white/5 shadow-2x-glow"
          >
            {/* Animated Mesh Background */}
            <div className="absolute inset-0 opacity-20 pointer-events-none">
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_50%,hsl(37,90%,56%_/_0.2)_0%,transparent_50%),radial-gradient(circle_at_70%_50%,hsl(200,60%,50%_/_0.2)_0%,transparent_50%)]" />
            </div>
            
            <div className="relative z-10 max-w-4xl mx-auto">
              <Sparkles className="h-14 w-14 text-white/20 mx-auto mb-8 animate-pulse" />
              <h2 className="mb-6 font-display text-4xl font-black text-white md:text-7xl tracking-tighter">
                <Trans i18nKey="hero.footer_title">
                  Ready to <span className="text-gradient">Explore</span> Modernity?
                </Trans>
              </h2>
              <p className="mx-auto mb-12 max-w-xl text-xl text-white/60 font-medium">
                {t('hero.footer_desc')}
              </p>
              <Link to="/planner">
                <Button size="lg" className="btn-hero h-16 px-10 rounded-2xl text-lg font-bold group shadow-glow">
                  {t('hero.cta')} <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
