import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Compass, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px]" />
      </div>
      
      <div className="relative z-10 text-center max-w-lg">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-white/5 border border-white/10 mb-8 shadow-2x-glow animate-float">
          <Compass className="h-10 w-10 text-primary" />
        </div>
        
        <h1 className="mb-4 text-5xl md:text-6xl font-black font-display tracking-tighter text-foreground">
          {t('not_found.title')}
        </h1>
        
        <p className="mb-10 text-lg text-muted-foreground leading-relaxed font-medium">
          {t('not_found.desc')}
        </p>
        
        <Button asChild className="btn-hero h-14 px-8 rounded-2xl group shadow-glow">
          <Link to="/">
            <Sparkles className="mr-2 h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
            {t('not_found.back_btn')}
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
