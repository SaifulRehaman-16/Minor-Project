import { motion } from "framer-motion";
import { Plus, Map as MapIcon, Check } from "lucide-react";
import WeatherBadge from "./WeatherBadge";
import ActivityCard from "./ActivityCard";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

interface Activity {
  time: string;
  title: string;
  description: string;
  cost: string;
  type: "attraction" | "food" | "transport" | "hotel";
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

interface DaySectionProps {
  day: Day;
  index: number;
  destination: string;
  readOnly?: boolean;
  isViewingOnMap?: boolean;
  onShowOnMap?: () => void;
  onUpdateActivity: (activityIndex: number, updated: Activity) => void;
  onDeleteActivity: (activityIndex: number) => void;
  onAddActivity: () => void;
}

const DaySection = ({ 
  day, 
  index, 
  destination, 
  readOnly, 
  isViewingOnMap,
  onShowOnMap,
  onUpdateActivity, 
  onDeleteActivity, 
  onAddActivity 
}: DaySectionProps) => {
  const { t } = useTranslation();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <div className="mb-3 sm:mb-4 flex flex-wrap items-center gap-2 sm:gap-3">
        <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-primary font-display text-xs sm:text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20">
          {day.day}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-display text-lg sm:text-xl font-semibold text-foreground">{t('day_section.day')} {day.day}</h2>
          {day.title && <p className="text-xs sm:text-sm text-muted-foreground truncate">{day.title}</p>}
        </div>
        
        <div className="flex items-center gap-2">
           {onShowOnMap && (
            <Button
              variant="outline"
              size="sm"
              onClick={onShowOnMap}
              className={`h-8 rounded-lg px-2 text-[10px] uppercase font-bold tracking-widest transition-all ${isViewingOnMap ? 'bg-primary/20 text-primary border-primary/30' : 'bg-white/5 border-white/10 text-muted-foreground'}`}
            >
              {isViewingOnMap ? <Check className="h-3 w-3 mr-1" /> : <MapIcon className="h-3 w-3 mr-1" />}
              {isViewingOnMap ? t('day_section.viewing') : t('day_section.map')}
            </Button>
          )}
          {day.weather && <WeatherBadge weather={day.weather} />}
        </div>
      </div>
      
      <div className="ml-4 sm:ml-5 space-y-2 sm:space-y-3 border-l-2 border-border pl-4 sm:pl-8 py-2 relative">
        <div className="absolute top-0 left-[-2px] h-3 w-[2px] bg-background" />
        <div className="absolute bottom-0 left-[-2px] h-3 w-[2px] bg-background" />
        
        {day.activities?.map((act, ai) => (
          <div key={ai} className="relative">
            <div className="absolute left-[-37px] sm:left-[-41px] top-8 sm:top-10 h-3 w-3 rounded-full border-2 border-primary bg-background z-10 shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
            <ActivityCard
              activity={act}
              destination={destination}
              readOnly={readOnly}
              onUpdate={(updated) => onUpdateActivity(ai, updated)}
              onDelete={() => onDeleteActivity(ai)}
            />
          </div>
        ))}
        
        {!readOnly && (
          <button
            type="button"
            onClick={onAddActivity}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-2.5 sm:py-3 text-xs sm:text-sm font-medium text-muted-foreground transition-all hover:border-primary/50 hover:text-primary hover:bg-primary/5 group"
          >
            <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform group-hover:rotate-90" /> {t('day_section.add_activity')}
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default DaySection;
