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
    const { title, destination } = await req.json();

    if (!title) {
      return new Response(
        JSON.stringify({ error: "Title is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Try multiple search queries for best results
    const queries = [
      `${title} ${destination || ""}`.trim(),
      title,
      destination || "",
    ];

    for (const query of queries) {
      if (!query) continue;

      // Search Wikipedia for the place
      const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&srlimit=3&format=json`;
      const searchRes = await fetch(searchUrl);
      const searchData = await searchRes.json();
      const results = searchData?.query?.search;

      if (!results || results.length === 0) continue;

      // Try each search result to find one with an image
      for (const result of results) {
        const pageTitle = result.title;
        const imageUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(pageTitle)}&prop=pageimages&pithumbsize=800&format=json`;
        const imageRes = await fetch(imageUrl);
        const imageData = await imageRes.json();
        const pages = imageData?.query?.pages;

        if (pages) {
          for (const pageId of Object.keys(pages)) {
            const thumb = pages[pageId]?.thumbnail?.source;
            if (thumb) {
              console.log(`Found image for "${query}" from Wikipedia page "${pageTitle}"`);
              return new Response(
                JSON.stringify({ imageUrl: thumb }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" } }
              );
            }
          }
        }
      }
    }

    // Fallback: no image found
    return new Response(
      JSON.stringify({ error: "No image found for this place" }),
      { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("generate-place-image error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
