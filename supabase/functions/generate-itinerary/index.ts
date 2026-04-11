const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { destination, startPlace, days, budget, interests, companion, startDate } = await req.json();

    if (!destination || !days) {
      return new Response(JSON.stringify({ error: "Destination and days are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
    if (!GROQ_API_KEY) {
      console.error("GROQ_API_KEY not found in environment secrets");
      throw new Error("GROQ_API_KEY is not configured in Supabase Secrets");
    }

    const interestsStr = Array.isArray(interests) && interests.length > 0 ? interests.join(", ") : "general sightseeing";

    const prompt = `CRITICAL: You are an expert travel assistant. You MUST provide a jam-packed itinerary with 8-10 activities EVERY SINGLE DAY. 
Failure to provide at least 8 activities per day will result in a system error. 
Each day include: Breakfast, Morning Sightseeing, Lunch, Afternoon Activity, Evening Relaxation, Dinner, and Nightlife/Rest.

Respond ONLY with valid raw JSON following this exact structure (note the multiple activities):
{
  "trip_title": "String",
  "destination": "Location",
  "summary": "overview",
  "estimated_total": "₹XXXXX",
  "budget_breakdown": { "stay": "₹XXXXX", "food": "₹XXXXX", "transport": "₹XXXXX", "activities": "₹XXXXX" },
  "days": [ 
    { 
      "day": 1, 
      "title": "Day Theme", 
      "weather": { "temperature": "XX°C", "condition": "Sunny", "icon": "☀️" }, 
      "activities": [ 
        { "time": "08:00 AM", "title": "Breakfast at X", "description": "...", "cost": "₹XXX", "type": "food", "lat": 0, "lng": 0 },
        { "time": "10:00 AM", "title": "Visit Y", "description": "...", "cost": "₹XXX", "type": "attraction", "lat": 0, "lng": 0 }
      ] 
    } 
  ]
}

Important rules:
- All costs must be in Indian Rupees (₹)
- PROVIDE 8-10 ACTIVITIES PER DAY.
- PROVIDE REAL COORDINATES.
- Each day should have a hotel check-in as the last activity (except the last day)
- The last day should end with departure/return transport.
- Trip details: Destination: ${destination}, Days: ${days}, Start: ${startPlace || "their home city"}, Budget: ₹${budget || "50000"}, Interests: ${interestsStr}, Companion: ${companion === "Solo" ? "solo" : `with ${companion?.toLowerCase() || "solo"}`}, Start Date: ${startDate || "N/A"}`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: "You are an expert travel planner. You ONLY respond with valid JSON. No markdown formatting, no code blocks, no explanations — just raw JSON.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`Groq API error (${response.status}):`, errText);
      return new Response(JSON.stringify({ error: `AI Provider Error: ${response.status}. Please check your Groq billing and keys.` }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content received from AI provider");
    }

    // Robust JSON cleaning to strip markdown fences if present
    let cleanContent = content.trim();
    if (cleanContent.startsWith("```")) {
      cleanContent = cleanContent.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    try {
      const itinerary = JSON.parse(cleanContent);
      return new Response(JSON.stringify(itinerary), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", cleanContent);
      return new Response(JSON.stringify({ error: "AI returned an invalid JSON format. Please try again." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (e) {
    console.error("generate-itinerary critical failure:", e);
    const message = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
