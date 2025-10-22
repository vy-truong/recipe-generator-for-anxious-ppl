import OpenAI from "openai";

//api container 
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

//Instead of running on one big server far away, the code runs on smaller servers closer to the user
export const runtime = "edge"; // optional for faster response, serverless layer

export async function POST(req) {
  try {
    // Parse request data (ingredients + difficulty)
    const { ingredients, difficulty } = await req.json();
    console.log("[API] Incoming payload", { ingredients, difficulty });

    const normalizedDifficulty = typeof difficulty === "string" ? difficulty.toLowerCase() : "";
    const allowedDifficulties = ["easy", "medium", "hard", "surprise"];
    const selectedDifficulty = allowedDifficulties.includes(normalizedDifficulty)
      ? normalizedDifficulty
      : "medium";

    const ingredientsList = Array.isArray(ingredients)
      ? ingredients
      : typeof ingredients === "string"
      ? ingredients
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
      : [];

    if (!ingredientsList.length) {
      console.warn("[API] Missing ingredients");
      return new Response(JSON.stringify({ error: "Missing ingredients" }), { status: 400 });
    }

    const difficultyGuidance = {
      easy: {
        time: "10-20 minutes",
        tone: "Keep instructions beginner-friendly and minimal prep.",
      },
      medium: {
        time: "25-40 minutes",
        tone: "Include layered flavors with a moderate challenge for growing cooks.",
      },
      hard: {
        time: "45-70 minutes",
        tone: "Lean into ambitious techniques suited for confident home cooks.",
      },
      surprise: {
        time: "Mix of easy, medium, and hard ranges",
        tone: "Offer a playful variety spanning beginner to advanced home cooks.",
      },
    };

    const surprisePrompt = `
      You are FridgeChef - a professional chef, an encouraging culinary mentor guiding a home cook. A user has these ingredients available: ${ingredientsList.join(
        ", "
      )}.
      They want to be surprised with a variety of recipe challenges from different cuisines.

      Please produce five to eight recipes objects in valid JSON (no markdown). Requirements:
      - Provide one easy, one medium, and one hard recipe. Set the "difficulty" field accordingly.
      - Respect these time ranges: Easy 10-20 mins, Medium 25-40 mins, Hard 45-70 mins.
      - Use the provided ingredients as the foundation, adding sensible pantry items if necessary.
      - Write with a friendly, confidence-boosting tone aimed at home cooks.
      - Write clear, step-by-step cooking instructions in an objective, instructional tone (no first-person language). Use verbs that guide the reader, e.g. 'Slice', 'Whisk', 'Add', 'Cook'."

      Each recipe object must include:
      {
        "name": "Dish name",
        "description": "2–3 precise sentences preview the dish in a calm, mindful tone. Focus on freshness, balance, and the sensory rhythm of cooking. Use clean imagery and avoid overstatement. ",
        "difficulty": "easy | medium | hard",
        "time": {
          "totalMinutes": number,
          "breakdown": "Short note describing prep vs cook (e.g., 5 prep / 15 cook)"
        },
        "cuisine": "Cuisine inspiration from different countries and culture",
        "ingredients": [
          { "item": "Ingredient name", "quantity": "quantity + unit " }
        ],
        "steps": [" Write clear, step-by-step cooking instructions in an objective, instructional tone (no first-person language). Use verbs that guide the reader, e.g. 'Slice', 'Whisk', 'Add', 'Cook'.""],
        "proTip": "One sentence tip aligned with the recipe’s difficulty."
      }

      Return strictly valid JSON containing an array of the three recipes in the order: easy, medium, hard.
    `;

    const defaultPrompt = `
      You are FridgeChef, an encouraging culinary mentor. A user has these ingredients available: ${ingredientsList.join(
        ", "
      )}.
      They requested a ${selectedDifficulty} experience. Using those inputs, craft exactly four recipe options.

      Output strictly valid JSON (no markdown) that matches the schema below:
      [
        {
          "name": "Dish name",
          "description": "2–3 precise sentences preview the dish in a calm, mindful tone. Focus on freshness, balance, and the sensory rhythm of cooking. Use clean imagery and avoid overstatement. ",
          "difficulty": "${selectedDifficulty}",
          "time": {
            "totalMinutes": number,
            "breakdown": "Short note describing prep vs cook (e.g., 5 prep / 15 cook)"
          },
          "cuisine": "Cuisine inspiration from different countries and culture",
          "ingredients": [
            {
              "item": "Ingredient name",
              "quantity": "quantity + unit"
            }
          ],
          "steps": [
            " Write clear, step-by-step cooking instructions in an objective, instructional tone (no first-person language). Use verbs that guide the reader, e.g. 'Slice', 'Whisk', 'Add', 'Cook'.""
          ],
          "proTip": "One sentence tip tailored to ${selectedDifficulty} cooks."
        }
      ]

      Style requirements:
      - Total minutes must align with ${difficultyGuidance[selectedDifficulty].time}.
      - Ingredient list should prioritize the provided ingredients and note smart additions when needed.
      - ${difficultyGuidance[selectedDifficulty].tone}
      - Write with a friendly, confidence-boosting tone aimed at home cooks.
      - Write clear, step-by-step cooking instructions in an objective, instructional tone (no first-person language). Use verbs that guide the reader, e.g. 'Slice', 'Whisk', 'Add', 'Cook'."
    `;

    const prompt = selectedDifficulty === "surprise" ? surprisePrompt : defaultPrompt;

    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: `
            You are FridgeChef — a professional yet warm culinary mentor for home cooks.
            Your goal is to transform simple ingredients into mouthwatering recipes that are
            descriptive, approachable, and emotionally engaging.

            Style Guidelines:
            - Write clearly for everyday home cooks (no jargon).
            - Use sensory, precise language that evokes smell, texture, and flavor.
            - Keep descriptions tight: 2–3 sentences max, vivid but realistic.
            - Write recipe steps in *instructional tone* (no first-person).
            - Always start steps with a verb (e.g., "Slice", "Whisk", "Bake").
            - Be warm, encouraging, and confidence-boosting — like a friendly pro chef.

            Output Format Rules:
            - Always return strictly valid JSON (no markdown, no commentary).
            - If multiple recipes are requested, return an array of recipe objects.
            - Each recipe object must follow the provided schema exactly.
          `,
        },
        { role: "user", content: prompt },
      ],
    });

    //Formats the AI’s answer into JSON and sends it back to frontend.
    // When two computers talk, they can’t just “say” text. They must exchange structured data (JSON).
    //If anything breaks (like a missing key or network failure), 
    // it catches the error and sends a readable message instead of crashing.
    const aiReply = response.choices?.[0]?.message?.content?.trim();

    if (!aiReply) {
      throw new Error("The recipe assistant returned an empty response.");
    }

    const cleaned = aiReply.replace(/```json|```/g, "").trim();
    console.log("[API] Raw AI reply", aiReply);
    let parsedReply;

    try {
      parsedReply = JSON.parse(cleaned);
      console.log("[API] Parsed AI reply", parsedReply);
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", cleaned);
      throw new Error("The recipe assistant returned data in an unexpected format.");
    }

    if (!Array.isArray(parsedReply) || parsedReply.length === 0) {
      throw new Error("The recipe assistant returned an empty recipe list.");
    }

    console.log("[API] Responding with", { count: parsedReply.length });

    return new Response(
      JSON.stringify({
        reply: parsedReply,
        meta: {
          difficulty: selectedDifficulty,
          ingredients: ingredientsList,
        },
      }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("[API] Request failed", error);
    return new Response(
      JSON.stringify({ error: error.message || "Something went wrong" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
