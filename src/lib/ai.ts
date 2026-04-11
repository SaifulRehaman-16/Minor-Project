const MODEL_NAME = "llama-3.3-70b-versatile";
const MAX_RETRIES = 3;
const INITIAL_BACKOFF = 2000; // 2 seconds

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const callGroqInternal = async (apiKey: string, prompt: string) => {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL_NAME,
      messages: [
        {
          role: "system",
          content: "You are an expert travel planner. You ONLY respond with valid raw JSON. No markdown, no explanations.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || `Groq API Error: ${response.status} ${response.statusText}`);
  }

  const result = await response.json();
  const content = result.choices?.[0]?.message?.content;
  
  if (!content) {
    throw new Error("Groq failed to generate any content. Please try again.");
  }

  try {
    return JSON.parse(content);
  } catch (parseError) {
    console.error("Failed to parse Groq response as JSON:", content);
    throw new Error("The AI returned content in an unexpected format. Please try again.");
  }
};

export const generateTravelItinerary = async (apiKey: string, prompt: string) => {
  let lastError: any;
  
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      if (attempt > 0) {
        const backoff = INITIAL_BACKOFF * Math.pow(2, attempt - 1);
        console.log(`[Groq] Retry attempt ${attempt}/${MAX_RETRIES} after ${backoff}ms...`);
        await delay(backoff);
      } else {
        console.log(`[Groq] Initializing generation for model: ${MODEL_NAME}`);
      }

      return await callGroqInternal(apiKey, prompt);
    } catch (error: any) {
      lastError = error;
      console.warn(`[Groq] Attempt ${attempt + 1} failed:`, error.message);
      
      // Don't retry for Auth errors or missing models
      if (error.message?.includes("401") || error.message?.includes("404") || error.message?.includes("api_key")) {
        break;
      }
      
      if (attempt === MAX_RETRIES) {
        break;
      }
    }
  }

  console.error("[Groq] All generation attempts exhausted.", lastError);
  
  if (lastError.message?.includes("401") || lastError.message?.includes("api_key")) {
    throw new Error("Invalid Groq API Key. Please check your environment variables.");
  }
  if (lastError.message?.includes("429")) {
    throw new Error("Groq rate limit exceeded. Please wait a moment before trying again.");
  }
  
  throw new Error(lastError.message || "An unexpected error occurred while generating your itinerary with Groq.");
};

export const generateDestinationDetail = async (apiKey: string, cityName: string) => {
  const prompt = `Create a deep-dive travel guide for ${cityName}.
Respond ONLY with valid JSON in this structure:
{
  "special_title": "Short poetic title (e.g. City of Pearls and Nizams)",
  "narrative": "A compelling 3-4 sentence narrative about what makes this place unique, its vibe, and history.",
  "recommended_duration": "E.g. 3-5 Days",
  "peak_season": "E.g. October to March",
  "famous_places": [
    {
      "name": "Place Name",
      "description": "Why it's iconic",
      "speciality": "Unique detail"
    }
  ]
}
Include exactly 5 famous places. Do not use markdown.`;

  return await generateTravelItinerary(apiKey, prompt);
};
