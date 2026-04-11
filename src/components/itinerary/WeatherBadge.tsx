interface Weather {
  temperature: string;
  condition: string;
  icon: string;
}

interface WeatherBadgeProps {
  weather: Weather;
}

const WeatherBadge = ({ weather }: WeatherBadgeProps) => {
  const isLive = weather.condition.includes("(Live)");
  const displayCondition = isLive ? weather.condition.replace(" (Live)", "") : weather.condition;

  return (
    <div className={`inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 transition-all duration-500 ${
      isLive 
        ? "border-primary/40 bg-primary/5 shadow-glow shadow-primary/5" 
        : "border-border bg-accent/50"
    }`}>
      <span className="text-lg">{weather.icon}</span>
      <div className="flex flex-col leading-none">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-semibold text-foreground">{weather.temperature}</span>
          {isLive && (
            <span className="flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-1.5 w-1.5 rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary"></span>
            </span>
          )}
        </div>
        <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
          {displayCondition}
        </span>
      </div>
    </div>
  );
};

export default WeatherBadge;

