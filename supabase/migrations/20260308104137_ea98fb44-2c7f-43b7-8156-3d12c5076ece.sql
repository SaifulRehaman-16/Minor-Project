CREATE TABLE public.itinerary_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  itinerary_id uuid NOT NULL REFERENCES public.itineraries(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.itinerary_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view reviews for any itinerary" ON public.itinerary_reviews FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert their own reviews" ON public.itinerary_reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own reviews" ON public.itinerary_reviews FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own reviews" ON public.itinerary_reviews FOR DELETE TO authenticated USING (auth.uid() = user_id);