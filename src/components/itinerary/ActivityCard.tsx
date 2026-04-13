import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { ReactNode } from "react";
import { MapPin, Bus, Hotel, Clock, ExternalLink, Pencil, Trash2, Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";

interface Activity {
  time: string;
  title: string;
  description: string;
  cost: string;
  type: "attraction" | "food" | "transport" | "hotel";
  image_url?: string;
}

import SafeImage from "@/components/ui/SafeImage";

const typeColors: Record<string, string> = {
  attraction: "bg-accent text-accent-foreground",
  food: "bg-secondary/15 text-secondary",
  transport: "bg-muted text-muted-foreground",
  hotel: "bg-primary/10 text-primary",
};

const typeIcons: Record<string, ReactNode> = {
  attraction: <MapPin className="h-4 w-4" />,
  food: <Clock className="h-4 w-4" />,
  transport: <Bus className="h-4 w-4" />,
  hotel: <Hotel className="h-4 w-4" />,
};

interface ActivityCardProps {
  activity: Activity;
  destination: string;
  readOnly?: boolean;
  onUpdate: (updated: Activity) => void;
  onDelete: () => void;
}

const ActivityCard = ({ activity, destination, readOnly, onUpdate, onDelete }: ActivityCardProps) => {
  const { t } = useTranslation();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Activity>(activity);
  const actType = activity.type || "attraction";

  const handleSave = () => {
    onUpdate(draft);
    setEditing(false);
  };

  const handleCancel = () => {
    setDraft(activity);
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="card-travel !p-3 sm:!p-4 ring-2 ring-primary/30">
        <div className="space-y-3">
          <div className="grid gap-2 grid-cols-1 sm:grid-cols-2">
            <Input
              value={draft.time}
              onChange={(e) => setDraft({ ...draft, time: e.target.value })}
              placeholder="Time (e.g. 10:00 AM)"
              className="text-sm"
            />
            <Input
              value={draft.cost}
              onChange={(e) => setDraft({ ...draft, cost: e.target.value })}
              placeholder="Cost (e.g. ₹500)"
              className="text-sm"
            />
          </div>
          <Input
            value={draft.title}
            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            placeholder="Activity title"
            className="font-semibold"
          />
          <Input
            value={draft.description}
            onChange={(e) => setDraft({ ...draft, description: e.target.value })}
            placeholder="Description"
            className="text-sm"
          />
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground">{t('profile.type') || 'Type'}:</span>
            {(["attraction", "food", "transport", "hotel"] as const).map((t_key) => (
              <button
                key={t_key}
                type="button"
                onClick={() => setDraft({ ...draft, type: t_key })}
                className={`rounded-full px-2 py-0.5 text-xs font-medium transition-all ${draft.type === t_key
                  ? "ring-2 ring-primary " + typeColors[t_key]
                  : "bg-muted/50 text-muted-foreground"
                  }`}
              >
                {t(`shared.${t_key}`)}
              </button>
            ))}
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={handleCancel}
              className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors"
            >
              <X className="h-3 w-3" /> {t('dashboard.cancel')}
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Check className="h-3 w-3" /> {t('profile.save_btn')}
            </button>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="card-travel !p-0 group overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-stretch">
        {activity.image_url && (
          <div className="relative h-48 sm:h-auto sm:w-48 overflow-hidden shrink-0">
            <SafeImage
              src={activity.image_url}
              alt={activity.title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              query={`${activity.title}, ${destination}`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent sm:hidden" />
          </div>
        )}
        <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="mb-1 flex flex-wrap items-center gap-2">
              {activity.time && <span className="text-xs font-medium text-muted-foreground">{activity.time}</span>}
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${typeColors[actType] || typeColors.attraction}`}>
                {typeIcons[actType] || typeIcons.attraction} {t(`shared.${actType}`)}
              </span>
            </div>
            <h3 className="font-display text-base sm:text-lg font-bold text-foreground break-words group-hover:text-primary transition-colors">
              {activity.title}
            </h3>
            {activity.description && <p className="mt-1 text-xs sm:text-sm text-muted-foreground break-words line-clamp-2 group-hover:line-clamp-none transition-all duration-300">
              {activity.description}
            </p>}
          </div>

          <div className="mt-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {activity.cost && <span className="whitespace-nowrap text-sm font-bold text-secondary">{activity.cost}</span>}
            </div>
            <div className="flex items-center gap-1.5">
              {!readOnly && (
                <>
                  <button
                    type="button"
                    onClick={() => setEditing(true)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-white/5 border border-white/10 px-3 py-1.5 text-xs font-bold text-muted-foreground sm:opacity-0 sm:group-hover:opacity-100 transition-all hover:bg-primary/20 hover:text-primary hover:border-primary/30"
                    title="Edit activity"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={onDelete}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-white/5 border border-white/10 px-3 py-1.5 text-xs font-bold text-muted-foreground sm:opacity-0 sm:group-hover:opacity-100 transition-all hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                    title="Delete activity"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={() => {
                  const encodedPlace = encodeURIComponent(`${activity.title}, ${destination}`);
                  const url = `https://www.google.com/maps/search/?api=1&query=${encodedPlace}`;
                  window.open(url, "_blank", "noopener,noreferrer");
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary/10 border border-primary/20 px-3 py-1.5 text-xs font-bold text-primary transition-all hover:bg-primary hover:text-white cursor-pointer"
                title={`View ${activity.title} on Google Maps`}
              >
                <MapPin className="h-3.5 w-3.5" />
                <span className="hidden sm:inline uppercase tracking-widest text-[10px]">{t('itinerary.view_map')}</span>
                <ExternalLink className="h-3 w-3 opacity-50" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityCard;
