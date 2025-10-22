"use client";
// This tells Next.js that this component uses client-side features (like useState and useEffect)

import { useEffect, useState } from "react";
import ShuffleButton from "./ShuffleButton";
import { exampleIngredientPool } from "../data/ingredients";

// Define display ranges for desktop and mobile experiences
const DESKTOP_RANGE = { min: 5, max: 7 };
const MOBILE_RANGE = { min: 3, max: 3 };

/**
 * pickRandomIngredients()
 * -----------------------------------------
 * Randomly shuffles the ingredient pool using the Fisher-Yates algorithm,
 * then returns a random number of ingredients between MIN_VISIBLE and MAX_VISIBLE.
 */
function getCountRange() {
  if (typeof window !== "undefined" && window.matchMedia("(max-width: 640px)").matches) {
    return MOBILE_RANGE;
  }
  return DESKTOP_RANGE;
}

function pickRandomIngredients(pool, range) {
  // Safety check: return an empty array if the input is invalid
  if (!Array.isArray(pool) || pool.length === 0) {
    console.warn("[pickRandomIngredients] Invalid or empty ingredient pool:", pool);
    return [];
  }

  // Clone the array to avoid mutating the original data
  const copy = [...pool];

  // Shuffle algorithm (Fisher-Yates)
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1)); // pick random index
    [copy[i], copy[j]] = [copy[j], copy[i]]; // swap elements
  }

  const { min, max } = range;
  const count = Math.min(copy.length, Math.floor(Math.random() * (max - min + 1)) + min);

  // Return only that many random ingredients
  return copy.slice(0, count);
}

/**
 * IngredientExamples Component
 * -----------------------------------------
 * Displays a few random "quick pick" ingredient buttons.
 * Includes a Shuffle button to generate new examples each time.
 */
export default function IngredientExamples({ onSelect }) {
  // State: stores the list of ingredients currently visible.
  // Start empty to avoid mismatches between server-rendered HTML and client hydration.
  const [visibleExamples, setVisibleExamples] = useState([]);

  // Effect: refresh ingredient examples once after initial render.
  useEffect(() => {
    const updateExamples = () => {
      const refreshed = pickRandomIngredients(exampleIngredientPool, getCountRange());
      console.log("[IngredientExamples] refresh:", refreshed);
      setVisibleExamples(refreshed);
    };

    updateExamples();
    window.addEventListener("resize", updateExamples);
    return () => window.removeEventListener("resize", updateExamples);
  }, []);

  // While examples are loading, do not render the list. Prevents hydration mismatch.
  if (!visibleExamples.length) {
    return null;
  }

  /**
   * shuffleExamples()
   * -----------------------------------------
   * Triggered when the Shuffle button is clicked.
   * Picks a new random batch of ingredients and updates the UI.
   */
  const shuffleExamples = () => {
    const shuffled = pickRandomIngredients(exampleIngredientPool, getCountRange());
    console.log("[IngredientExamples] Shuffle triggered:", shuffled);
    setVisibleExamples(shuffled);
  };

  // Component Render
  return (
    <div className="mb-5 text-left">
      {/* Header row: title + shuffle button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-sm sm:text-base font-medium text-[var(--color-text)] dark:text-[var(--color-textd)] opacity-75">
          Quick picks:
        </p>
        <ShuffleButton onClick={shuffleExamples} className="w-full sm:w-auto" />
      </div>

      {/* Ingredient list */}
      <div className="mt-3 flex flex-wrap gap-2">
        {visibleExamples.map((item) => (
          <button
            key={item}
            onClick={() => {
              console.log("[IngredientExamples] Example clicked:", item);
              // Safely call the onSelect callback if it's provided
              onSelect?.(item);
            }}
            type="button"
            className="px-3 py-1.5 rounded-full text-sm border border-default 
                       bg-surface hover:opacity-90 transition shadow-sm"
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}
