"use client"; 
// Ensures this component runs on the client side (important for hooks like useState, useEffect)

import { useEffect, useMemo, useState } from "react";
import ShuffleButton from "./ShuffleButton";

const DESKTOP_COUNT = 5;
const MOBILE_COUNT = 3;

/**
 * Utility function: pickRandomCombos
 * ----------------------------------
 * - Randomly shuffles an array of combos (Fisher-Yates algorithm)
 * - Returns a subset of 'count' items
 * - Protects against invalid or empty input arrays
 */
function pickRandomCombos(combos, count) {
  if (!Array.isArray(combos) || combos.length === 0) {
    console.warn("[pickRandomCombos] Invalid or empty combo list:", combos);
    return [];
  }

  // Copy array so we don’t mutate the original
  const copy = [...combos];

  // Fisher-Yates shuffle
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1)); // pick random index
    [copy[i], copy[j]] = [copy[j], copy[i]]; // swap
  }

  // Return a sliced subset of shuffled items
  return copy.slice(0, Math.min(count, copy.length));
}

/**
 * IngredientCombos Component
 * ---------------------------
 * Displays a few random ingredient suggestions at once.
 * Includes a Shuffle button that regenerates new random combos.
 */
export default function IngredientCombos({ combos, onSelect }) {
  // State: stores currently visible ingredient combos; start empty for hydration consistency.
  const [visibleCombos, setVisibleCombos] = useState([]);

  // useEffect: whenever the 'combos' prop changes, refresh visible items
  useEffect(() => {
    const updateCombos = () => {
      const refreshed = pickRandomCombos(combos, getVisibleCount());
      console.log("[IngredientCombos] Combos refreshed:", refreshed);
      setVisibleCombos(refreshed);
    };

    updateCombos();
    window.addEventListener("resize", updateCombos);
    return () => window.removeEventListener("resize", updateCombos);
  }, [combos]);

  // useMemo: check if we have any combos to show (avoid re-render performance hits)
  const hasCombos = useMemo(
    () => Array.isArray(visibleCombos) && visibleCombos.length > 0,
    [visibleCombos]
  );

  // If there are no combos, don't render anything
  if (!hasCombos) {
    return null;
  }

  /**
   * regenerateCombos
   * ----------------
   * Triggered when user clicks the Shuffle button.
   * Randomly picks new visible combos and updates state.
   */
  const regenerateCombos = () => {
    const shuffled = pickRandomCombos(combos, getVisibleCount());
    console.log("[IngredientCombos] Shuffle triggered:", shuffled);
    setVisibleCombos(shuffled);
  };

  // Component Render
  return (
    <div className="text-left w-full max-w-3xl mx-auto">
      {/* Header row: label + shuffle button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-sm sm:text-base uppercase tracking-wide text-[var(--color-text)] dark:text-[var(--color-textd)] opacity-60">
          Need inspo?
        </p>
        <ShuffleButton onClick={regenerateCombos} className="w-full sm:w-auto" />
      </div>

      {/* Ingredient buttons */}
      <div className="mt-3 flex flex-wrap gap-2">
        {visibleCombos.map((combo) => (
          <button
            key={combo}
            type="button"
            onClick={() => {
              console.log("[IngredientCombos] Combo clicked:", combo);
              onSelect?.(combo); // safely call onSelect if provided
            }}
            className="px-4 py-2 rounded-2xl border border-default 
                       bg-surface text-sm sm:text-base hover:opacity-90 transition shadow-sm"
          >
            {combo}
          </button>
        ))}
      </div>
    </div>
  );
}
function getVisibleCount() {
  if (typeof window !== "undefined" && window.matchMedia("(max-width: 640px)").matches) {
    return MOBILE_COUNT;
  }
  return DESKTOP_COUNT;
}
