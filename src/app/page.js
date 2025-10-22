"use client";

// React imports
import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import AppHeader from "./components/AppHeader";
import IngredientCombos from "./components/IngredientCombos";
import IngredientExamples from "./components/IngredientExamples";
import DifficultySelector from "./components/DifficultySelector";
import MainSidebar from "./components/MainSidebar";
import { comboSuggestions } from "./data/ingredients";
import supabase from "./config/supabaseClient"; // import the supabase client (future use for saving data)
import { useUser } from "./components/UserContext";

export default function HomePage() {
  const router = useRouter();
  const { user } = useUser();
  // ──────────────────────────────
  // STEP 1: DECLARE STATES
  // ──────────────────────────────
  // Store what user typed into the ingredients text area
  const [userIngredients, setUserIngredients] = useState("");
  const [hasSavedResults, setHasSavedResults] = useState(false);

  // Store loading state (true while waiting for AI to respond)
  const [isLoading, setIsLoading] = useState(false);

  // Store selected difficulty level
  const [difficulty, setDifficulty] = useState("easy");

  console.log("[HomePage] Render", {
    difficulty,
    isLoading,
    userIngredientsLength: userIngredients.length,
    userId: user?.id,
  });

  const userFirstName = useMemo(() => {
    const raw = user?.user_metadata?.first_name || user?.email?.split("@")[0] || "friend";
    return raw.replace(/[^a-zA-Z\s-]/g, " ").trim() || "friend";
  }, [user]);
  const headingText = user
    ? `Hi ${userFirstName}, what’s in your fridge today?`
    : "What’s in your fridge?";

  const difficultyOptions = [
    { value: "easy", label: "Easy" },
    { value: "medium", label: "Medium" },
    { value: "hard", label: "Hard" },
    { value: "surprise", label: "Surprise me" },
  ];

  useEffect(() => {
    if (typeof window === "undefined") return;
    const results = sessionStorage.getItem("fridgechef-results");
    setHasSavedResults(Boolean(results));
  }, []);

  // ──────────────────────────────
  // STEP 2: HANDLE INPUT SUGGESTION BUTTON CLICK
  // ──────────────────────────────
  // When user clicks one of the example ingredient buttons, fill the text area with that example
  const handleExampleClick = (ingredient) => {
    console.log("[HomePage] Example ingredient clicked", ingredient);
    const current = userIngredients
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    if (current.includes(ingredient)) {
      return;
    }

    const updated = [...current, ingredient];
    setUserIngredients(updated.join(", "));
    console.log("[HomePage] Updated ingredients after example", updated);
  };

  const handleComboClick = (comboText) => {
    console.log("[HomePage] Combo selected", comboText);
    setUserIngredients(comboText);
  };

  // ──────────────────────────────
  // STEP 3: HANDLE FORM SUBMISSION
  // ──────────────────────────────
  // When user clicks “Find Dishes” button
  const handleSubmit = async (event) => {
    console.log("[HomePage] Submit triggered");
    event.preventDefault(); // prevent the page from refreshing

    // If text area is empty, stop and warn user
    if (!userIngredients.trim()) {
      console.warn("[HomePage] Submit blocked: no ingredients provided");
      alert("Please enter your ingredients first 🍳");
      return;
    }

    const ingredientsList = userIngredients
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    if (!ingredientsList.length) {
      console.warn("[HomePage] Submit blocked: ingredient parsing returned empty array");
      alert("Please list at least one ingredient 🍅");
      return;
    }

    // Clear previous result and set loading state
    setIsLoading(true);
    console.log("[HomePage] Sending request", { ingredientsList, difficulty });

    try {
      // ──────────────────────────────
      // STEP 3A: SEND REQUEST TO YOUR OPENAI ROUTE
      // ──────────────────────────────
      // The /api/route endpoint is where your OpenAI API key lives.
      // We send the user's ingredients there, and it returns an AI-generated recipe suggestion.
      const response = await fetch("/api/route", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // Send structured data so API can tailor the recipe
        body: JSON.stringify({
          ingredients: ingredientsList,
          difficulty,
        }),
      });

      // Convert the AI’s reply from JSON format into JavaScript text
      const data = await response.json();
      console.log("[HomePage] Response received", { ok: response.ok, keys: Object.keys(data || {}) });

      // If the AI replied successfully, store it and navigate to results page
      if (response.ok && Array.isArray(data.reply)) {
        const payload = {
          recipes: data.reply,
          meta: data.meta ?? {
            difficulty,
            ingredients: ingredientsList,
          },
          generatedAt: Date.now(),
        };

        if (typeof window !== "undefined") {
          sessionStorage.setItem("fridgechef-results", JSON.stringify(payload));
          console.log("[HomePage] Stored results in sessionStorage", payload);
        }

        router.push("/results");
        console.log("[HomePage] Navigated to /results");
      } else {
        const fallbackMessage =
          data?.error || "Sorry, I couldn’t generate recipes this time. Please try again later.";
        console.warn("[HomePage] Non-OK response", { status: response.status, fallbackMessage, data });
        alert(fallbackMessage);
      }
    } catch (error) {
      console.error("Error contacting OpenAI route:", error);
      alert("An unexpected error occurred while generating your recipes.");
    } finally {
      // When everything is done (either success or fail), stop loading spinner
      setIsLoading(false);
      console.log("[HomePage] Request finished");
    }
  };

  // ──────────────────────────────
  // STEP 4: RETURN PAGE STRUCTURE
  // ──────────────────────────────
  return (
    <div className="min-h-screen flex flex-col bg-app">
      {/* ──────────────────────────────
          TOP NAVBAR SECTION
      ────────────────────────────── */}
      <AppHeader />

      {/* ──────────────────────────────
          HERO SECTION (CENTER CONTENT)
      ────────────────────────────── */}
      <main className="flex-1 w-full flex">
        <MainSidebar className="hidden lg:flex" />
        <section className="mx-auto max-w-4xl px-4 sm:px-6 py-8 sm:py-12 lg:py-16 flex flex-col items-center justify-center text-center min-h-[70vh] gap-6">

          {/* Main heading */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-heading dark:text-[var(--color-textd)]">
            {headingText}
          </h1>

          {/* Subheading / description */}
          <p className="text-sm sm:text-base text-[var(--color-text)] dark:text-[var(--color-textd)] max-w-2xl leading-relaxed">
            Tell us what you have, and we’ll inspire you with delicious dishes you can make right now.
          </p>

          {hasSavedResults && (
            <button
              type="button"
              onClick={() => router.push("/results")}
              className="inline-flex items-center gap-2 rounded-2xl border border-default bg-surface px-4 py-2 text-sm font-semibold hover:opacity-90 transition shadow"
            >
              Resume your last recipes
              <span className="text-base">→</span>
            </button>
          )}

          {/* ──────────────────────────────
              INPUT CARD AREA
          ────────────────────────────── */}
          <div className="w-full">
            <div className="mx-auto bg-surface rounded-3xl shadow-lg p-5 sm:p-6 md:p-8 border border-default">
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {/* Hidden label for accessibility */}
                <label htmlFor="ingredients" className="sr-only">
                  What’s in your fridge?
                </label>

                <IngredientExamples onSelect={handleExampleClick} />

                {/* Textarea for user ingredients input */}
                <textarea
                  id="ingredients"
                  rows={4}
                  value={userIngredients}
                  onChange={(e) => setUserIngredients(e.target.value)}
                  placeholder="Type your ingredients here 🥬 (e.g., egg, tomato, cucumber, rice, chicken)"
                  className="w-full resize-none rounded-2xl border border-default bg-transparent px-4 py-3 outline-none focus:ring-2 focus:ring-[var(--color-gradient-mid)] text-sm sm:text-base"
                />

                <p className="text-xs sm:text-sm text-[var(--color-text)] dark:text-[var(--color-textd)] text-left opacity-70">
                  ✨ Quick tip: The more specific, the better!
                </p>

                <DifficultySelector
                  options={difficultyOptions}
                  active={difficulty}
                  onSelect={setDifficulty}
                  disabled={isLoading}
                />

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="rounded-2xl px-6 py-3 
                  bg-[var(--color-button)] 
                  hover:bg-[var(--color-button-hl)] 
                  text-white text-sm sm:text-base font-semibold 
                  shadow transition 
                  hover:opacity-90 
                  disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Cooking ideas..." : "Find Dishes"}
                </button>
              </form>
            </div>

          </div>
          <div className="w-full">
            <IngredientCombos combos={comboSuggestions} onSelect={handleComboClick} />
          </div>
          {/* Account hint */}
          <p className="text-xs sm:text-sm text-[var(--color-text)] dark:text-[var(--color-textd)] opacity-60">
            You can browse recipes right away — create an account to save your favorites.
          </p>
        </section>
      </main>

      {/* ──────────────────────────────
          FOOTER
      ────────────────────────────── */}
      <footer className="border-t border-default mt-auto">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-6 text-center text-xs sm:text-sm text-[var(--color-text)] dark:text-[var(--color-textd)] opacity-60">
          © {new Date().getFullYear()} FridgeChef • Made to get you out of bed and cooking 🍳
        </div>
      </footer>
    </div>
  );
}
