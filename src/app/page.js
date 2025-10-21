"use client";

// React imports
import { useState } from "react";
import { useRouter } from "next/navigation";
import ThemeToggle from "./components/ThemeToggle"; // import the dark/light toggle component
import IngredientCombos from "./components/IngredientCombos";
import { comboSuggestions } from "./data/comboSuggestions";
import supabase from "./config/supabaseClient"; // import the supabase client (future use for saving data)

export default function HomePage() {
  const router = useRouter();
  // ──────────────────────────────
  // STEP 1: DECLARE STATES
  // ──────────────────────────────
  // Store what user typed into the ingredients text area
  const [userIngredients, setUserIngredients] = useState("");

  // Store loading state (true while waiting for AI to respond)
  const [isLoading, setIsLoading] = useState(false);

  // Store selected difficulty level
  const [difficulty, setDifficulty] = useState("easy");

  const difficultyOptions = [
    { value: "easy", label: "Easy" },
    { value: "medium", label: "Medium" },
    { value: "hard", label: "Hard" },
  ];

  // Example ingredient suggestions shown below input box
  const exampleIngredientSuggestions = [
    "egg",
    "beef",
    "rice",
    "tomato",
    "broccoli",
    "spam",
    "pasta",
    "chicken",
    "carrot",
    "bread",
  ];

  // ──────────────────────────────
  // STEP 2: HANDLE INPUT SUGGESTION BUTTON CLICK
  // ──────────────────────────────
  // When user clicks one of the example ingredient buttons, fill the text area with that example
  const handleExampleClick = (ingredient) => {
    const current = userIngredients
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    if (current.includes(ingredient)) {
      return;
    }

    const updated = [...current, ingredient];
    setUserIngredients(updated.join(", "));
  };

  const handleComboClick = (comboText) => {
    setUserIngredients(comboText);
  };

  // ──────────────────────────────
  // STEP 3: HANDLE FORM SUBMISSION
  // ──────────────────────────────
  // When user clicks “Find Dishes” button
  const handleSubmit = async (event) => {
    event.preventDefault(); // prevent the page from refreshing

    // If text area is empty, stop and warn user
    if (!userIngredients.trim()) {
      alert("Please enter your ingredients first 🍳");
      return;
    }

    const ingredientsList = userIngredients
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    if (!ingredientsList.length) {
      alert("Please list at least one ingredient 🍅");
      return;
    }

    // Clear previous result and set loading state
    setIsLoading(true);

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
        }

        router.push("/results");
      } else {
        const fallbackMessage =
          data?.error || "Sorry, I couldn’t generate recipes this time. Please try again later.";
        alert(fallbackMessage);
      }
    } catch (error) {
      console.error("Error contacting OpenAI route:", error);
      alert("An unexpected error occurred while generating your recipes.");
    } finally {
      // When everything is done (either success or fail), stop loading spinner
      setIsLoading(false);
    }
  };

  // ──────────────────────────────
  // STEP 4: RETURN PAGE STRUCTURE
  // ──────────────────────────────
  return (
    <div className="min-h-screen flex flex-col">
      {/* ──────────────────────────────
          TOP NAVBAR SECTION
      ────────────────────────────── */}
      <header className="w-full">
        <nav className="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between">
          {/* Left side: Logo and brand name */}
          <div className="flex items-center gap-3">
            {/* Logo icon inside a gradient square */}
            <span className="inline-flex h-10 w-10 rounded-2xl bg-gradient-main shadow-sm items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M12 3l2.2 4.6 5 .7-3.6 3.5.9 5-4.5-2.4L8 16.8l.9-5L5.3 8.3l5-.7L12 3Z"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className="font-semibold text-lg text-heading">FridgeChef</span>
          </div>

          {/* Right side: Theme toggle + login/signup buttons */}
          <div className="flex items-center gap-2">
            <ThemeToggle /> {/* Reusable dark/light toggle component */}
            <a
              href="/login"
              className="rounded-xl px-3 py-2 text-sm border border-[var(--color-border)] bg-surface hover:opacity-90 transition"
            >
              Log in
            </a>
            <a
              href="/signup"
              className="rounded-xl px-3 py-2 text-sm bg-gradient-main text-white shadow hover:opacity-90 transition"
            >
              Sign up
            </a>
          </div>
        </nav>
      </header>

      {/* ──────────────────────────────
          HERO SECTION (CENTER CONTENT)
      ────────────────────────────── */}
      <main className="flex-1 w-full">
        <section className="mx-auto max-w-4xl px-6 py-10 md:py-16 flex flex-col items-center justify-center text-center min-h-[70vh]">
          {/* App icon */}
          <div className="h-14 w-14 rounded-2xl bg-gradient-main shadow mb-6 flex items-center justify-center">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M4 11h16M6 7h12M8 15h8" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </div>

          {/* Main heading */}
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-heading dark:text-[var(--dark-color-text)]">
            What’s in your fridge?
          </h1>

          {/* Subheading / description */}
          <p className="mt-4 text-[0.975rem] md:text-basetext-[var(--color-text)] dark:text-[var(--dark-color-text)] max-w-2xl">
            Tell us what you have, and we’ll inspire you with delicious dishes you can make right now.
          </p>

          {/* ──────────────────────────────
              INPUT CARD AREA
          ────────────────────────────── */}
          <div className="mt-10 w-full">
            <div className="mx-auto max-w-3xl bg-surface rounded-3xl shadow-lg p-6 md:p-8 border border-[var(--color-border)]">
              <form onSubmit={handleSubmit}>
                {/* Hidden label for accessibility */}
                <label htmlFor="ingredients" className="sr-only">
                  What’s in your fridge?
                </label>

                <div className="mb-5 text-left">
                  <div className="flex flex-wrap gap-2">
                    {exampleIngredientSuggestions.map((example) => (
                      <button
                        key={example}
                        onClick={() => handleExampleClick(example)}
                        type="button"
                        className="px-3 py-1.5 rounded-full text-xs md:text-sm border border-[var(--color-border)] bg-surface hover:opacity-90 transition shadow-sm"
                      >
                        {example}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Textarea for user ingredients input */}
                <textarea
                  id="ingredients"
                  rows={3}
                  value={userIngredients}
                  onChange={(e) => setUserIngredients(e.target.value)}
                  placeholder="Type your ingredients here 🥬 (e.g., egg, tomato, cucumber, rice, chicken)"
                  className="w-full resize-none rounded-2xl border border-[var(--color-border)] bg-transparent px-4 py-3 outline-none focus:ring-2 focus:ring-[var(--color-gradient-mid)]"
                />

                <p className="mt-2 text-xs text-black/50 dark:text-white/60 text-left">
                  ✨ Quick tip: The more specific, the better!
                </p>

                <div className="mt-5 text-left">
                  <p className="text-sm font-medium text-black/70 dark:text-white/70">
                    Choose your vibe:
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {difficultyOptions.map((option) => {
                      const isActive = option.value === difficulty;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setDifficulty(option.value)}
                          aria-pressed={isActive}
                          className={`rounded-2xl px-4 py-2 text-sm transition border ${
                            isActive
                              ? "bg-[#FDAA6B] text-white border-transparent shadow"
                              : "bg-surface text-black border-black hover:opacity-90 dark:bg-transparent dark:text-white dark:border-white/70"
                          }`}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="mt-4 w-full md:w-auto inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3 bg-[#FDAA6B] text-white font-semibold shadow hover:opacity-90 transition disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Cooking ideas..." : "Find Dishes"}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path
                      d="M5 12h14M13 5l7 7-7 7"
                      stroke="white"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </form>
            </div>

          </div>
          <div className="mt-8">
            <IngredientCombos combos={comboSuggestions} onSelect={handleComboClick} />
          </div>
          {/* Account hint */}
          <p className="mt-10 text-xs text-black/50 dark:text-white/50">
            You can browse recipes right away — create an account to save your favorites.
          </p>
        </section>
      </main>

      {/* ──────────────────────────────
          FOOTER
      ────────────────────────────── */}
      <footer className="border-t border-[var(--color-border)]">
        <div className="mx-auto max-w-5xl px-6 py-6 text-center text-sm text-black/50 dark:text-white/50">
          © {new Date().getFullYear()} FridgeChef • Made to get you out of bed and cooking 🍳
        </div>
      </footer>
    </div>
  );
}
