
DROP POLICY IF EXISTS "Authenticated users can view any itinerary" ON public.itineraries;

CREATE POLICY "Anyone can view any itinerary"
ON public.itineraries
FOR SELECT
TO anon, authenticated
USING (true);
