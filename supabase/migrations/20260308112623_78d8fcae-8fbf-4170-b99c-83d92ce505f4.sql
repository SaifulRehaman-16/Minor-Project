
DROP POLICY IF EXISTS "Users can view their own itineraries" ON public.itineraries;

CREATE POLICY "Authenticated users can view any itinerary"
ON public.itineraries
FOR SELECT
TO authenticated
USING (true);
