import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Send, Loader2, Trash2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

interface Review {
  id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  profile?: {
    display_name: string | null;
    avatar_url: string | null;
  };
}

interface ReviewSectionProps {
  itineraryId?: string;
  destination: string;
}

const StarRating = ({ rating, onRate, interactive = false, size = "md" }: {
  rating: number;
  onRate?: (r: number) => void;
  interactive?: boolean;
  size?: "sm" | "md";
}) => {
  const [hover, setHover] = useState(0);
  const sizeClass = size === "sm" ? "h-3.5 w-3.5" : "h-5 w-5 sm:h-6 sm:w-6";

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => onRate?.(star)}
          onMouseEnter={() => interactive && setHover(star)}
          onMouseLeave={() => interactive && setHover(0)}
          className={`transition-colors ${interactive ? "cursor-pointer" : "cursor-default"}`}
        >
          <Star
            className={`${sizeClass} transition-colors ${
              star <= (hover || rating)
                ? "fill-secondary text-secondary"
                : "text-border"
            }`}
          />
        </button>
      ))}
    </div>
  );
};

const ReviewSection = ({ itineraryId, destination }: ReviewSectionProps) => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (!itineraryId) {
      setLoading(false);
      return;
    }
    fetchReviews();
  }, [itineraryId]);

  const fetchReviews = async () => {
    if (!itineraryId) return;
    try {
      const { data: reviewData, error: reviewError } = await supabase
        .from("itinerary_reviews")
        .select("*")
        .eq("itinerary_id", itineraryId)
        .order("created_at", { ascending: false });

      if (reviewError) throw reviewError;

      if (reviewData && reviewData.length > 0) {
        const userIds = [...new Set(reviewData.map(r => r.user_id))];
        
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("display_name, avatar_url, user_id")
          .in("user_id", userIds);

        if (profileError) throw profileError;

        const profileMap = new Map();
        profileData?.forEach(p => {
          profileMap.set(p.user_id, p);
        });

        setReviews(reviewData.map(r => ({ ...r, profile: profileMap.get(r.user_id) || null })));
      } else {
        setReviews([]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!user || !itineraryId || rating === 0) {
      toast({ title: t('reviews.rating_error'), variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("itinerary_reviews")
        .insert({
          itinerary_id: itineraryId,
          user_id: user.id,
          rating,
          comment: comment.trim() || null,
        });

      if (error) throw error;

      toast({ title: t('reviews.success_title'), description: t('reviews.success_desc') });
      setRating(0);
      setComment("");
      fetchReviews();
    } catch (error: any) {
      toast({ title: t('reviews.error_title'), description: error.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (reviewId: string) => {
    try {
      const { error } = await supabase
        .from("itinerary_reviews")
        .delete()
        .eq("id", reviewId);
      
      if (error) throw error;

      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      toast({ title: t('reviews.delete_title') });
    } catch (e) {
      console.error(e);
    }
  };

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const userHasReviewed = reviews.some((r) => r.user_id === user?.id);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString(i18n.language === 'hi' ? 'hi-IN' : "en-IN", { month: "short", day: "numeric", year: "numeric" });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="mt-10 sm:mt-12"
    >
      <div className="card-travel !p-5 sm:!p-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            <div>
              <h3 className="font-display text-lg sm:text-xl font-semibold text-foreground">
                {t('reviews.title')}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {t('reviews.share_thoughts')} {destination} {t('reviews.itinerary_suffix')}
              </p>
            </div>
          </div>
          {avgRating && (
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-foreground">{avgRating}</span>
              <div>
                <StarRating rating={Math.round(Number(avgRating))} size="sm" />
                <p className="text-xs text-muted-foreground">{reviews.length} {reviews.length !== 1 ? t('reviews.reviews_count_plural') : t('reviews.reviews_count')}</p>
              </div>
            </div>
          )}
        </div>

        {/* Submit form */}
        {user && itineraryId && !userHasReviewed && (
          <div className="mb-6 rounded-xl border border-border bg-muted/30 p-4 sm:p-5">
            <p className="mb-3 text-sm font-medium text-foreground">{t('reviews.rating_label')}</p>
            <StarRating rating={rating} onRate={setRating} interactive size="md" />
            <Textarea
              placeholder={t('reviews.placeholder')}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="mt-3 min-h-[80px] bg-background text-sm"
            />
            <div className="mt-3 flex justify-end">
              <Button
                onClick={handleSubmit}
                disabled={submitting || rating === 0}
                size="sm"
                className="gap-2"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5" />
                )}
                {t('reviews.submit')}
              </Button>
            </div>
          </div>
        )}

        {!user && (
          <div className="mb-6 rounded-xl border border-dashed border-border bg-muted/20 p-4 text-center">
            <p className="text-sm text-muted-foreground">{t('reviews.signin')}</p>
          </div>
        )}

        {!itineraryId && (
          <div className="mb-6 rounded-xl border border-dashed border-border bg-muted/20 p-4 text-center">
            <p className="text-sm text-muted-foreground">{t('reviews.save_to_review')}</p>
          </div>
        )}

        {/* Reviews list */}
        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="py-6 text-center">
            <Star className="mx-auto mb-2 h-8 w-8 text-border" />
            <p className="text-sm text-muted-foreground">{t('reviews.no_reviews')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {reviews.map((review) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="rounded-xl border border-border bg-background p-3 sm:p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 sm:gap-3">
                      {review.profile?.avatar_url ? (
                        <img
                          src={review.profile.avatar_url}
                          alt=""
                          className="h-8 w-8 rounded-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                          {(review.profile?.display_name || "U").slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {review.profile?.display_name || t('reviews.traveler')}
                        </p>
                        <div className="flex items-center gap-2">
                          <StarRating rating={review.rating} size="sm" />
                          <span className="text-xs text-muted-foreground">{formatDate(review.created_at)}</span>
                        </div>
                      </div>
                    </div>
                    {review.user_id === user?.id && (
                      <button
                        onClick={() => handleDelete(review.id)}
                        className="rounded-full p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                        title="Delete review"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  {review.comment && (
                    <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed pl-10 sm:pl-11">
                      {review.comment}
                    </p>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ReviewSection;
