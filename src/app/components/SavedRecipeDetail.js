"use client";

import { useMemo } from "react";
import { IoArrowBackOutline } from "react-icons/io5";

// ────────────────────────────────────────────────
// Helper: normalize difficulty for consistency
// ────────────────────────────────────────────────
function normalizeDifficulty(value) {
  if (!value) return "";
  const normalized = value.toString().toLowerCase();
  if (normalized === "easy" || normalized === "simple") return "Simple";
  if (normalized === "medium") return "Medium";
  if (normalized === "hard" || normalized === "advanced") return "Hard";
  return value;
}

// ────────────────────────────────────────────────
// Helper: safely turn input into array
// ────────────────────────────────────────────────
function toArray(value) {
  if (Array.isArray(value)) {
    return value.map((entry) => {
      if (typeof entry === "string") {
        const trimmed = entry.trim();
        if (!trimmed) return "";
        if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
          try {
            return JSON.parse(trimmed);
          } catch {
            return trimmed;
          }
        }
        return trimmed;
      }
      if (typeof entry === "object" && entry !== null) return entry;
      return String(entry);
    });
  }

  if (typeof value === "string" && value.trim().length > 0) {
    return value
      .split(/\r?\n/)
      .map((entry) => entry.trim())
      .filter(Boolean);
  }

  if (typeof value === "object" && value !== null) return [value];

  return [];
}

// ────────────────────────────────────────────────
// Helper: format ingredient text
// ────────────────────────────────────────────────
function formatIngredient(entry) {
  if (typeof entry === "string") return entry;
  if (typeof entry === "object" && entry !== null) {
    const name =
      entry.item ||
      entry.name ||
      entry.ingredient ||
      entry.title ||
      entry.text ||
      "";
    const quantity =
      entry.quantity ||
      entry.amount ||
      entry.measure ||
      entry.qty ||
      "";

    if (!name && !quantity) return "";
    return quantity ? `${name} (${quantity})` : name;
  }
  return String(entry);
}

// ────────────────────────────────────────────────
// Helper: format step text
// ────────────────────────────────────────────────
function formatStep(entry, index) {
  if (typeof entry === "string") return entry;
  if (typeof entry === "object" && entry !== null) {
    const prefix =
      typeof entry.stepNumber !== "undefined"
        ? `Step ${entry.stepNumber}:`
        : `Step ${index + 1}:`;
    const description =
      entry.text ||
      entry.instruction ||
      entry.description ||
      entry.detail ||
      "";

    return [prefix, description].filter(Boolean).join(" ").trim();
  }
  return String(entry);
}

// ────────────────────────────────────────────────
// Main Component
// ────────────────────────────────────────────────
export default function SavedRecipeDetail({ recipe, onBack }) {
  // clean and normalize all time-related labels
  const timeInfo = useMemo(() => {
    const total =
      typeof recipe?.estimated_time === "number"
        ? `${recipe.estimated_time} mins`
        : "";

    // helper to clean up messy time strings like "5prep" or "10cook"
    const formatTimeValue = (value) => {
      if (!value) return "";
      const digits = value.toString().match(/\d+/);
      if (!digits) return "";
      return `${digits[0]} mins`;
    };

    const prep = formatTimeValue(recipe?.prep_time || recipe?.time?.prep);
    const cook = formatTimeValue(recipe?.cook_time || recipe?.time?.cook);
    const breakdown = recipe?.breakdown || recipe?.time?.breakdown || "";

    return { total, prep, cook, breakdown };
  }, [recipe]);

  const difficultyLabel = normalizeDifficulty(recipe?.difficulty);
  const ingredients = toArray(recipe?.ingredients)
    .map((item) => formatIngredient(item))
    .filter(Boolean);
  const steps = toArray(recipe?.instructions || recipe?.steps)
    .map((item, index) => formatStep(item, index))
    .filter(Boolean);
  const tags = Array.isArray(recipe?.tags) ? recipe.tags : [];

  return (
    <div className="mx-auto max-w-3xl bg-surface border border-default shadow-lg rounded-3xl overflow-hidden">
      {/* back button  */}
      <div className="px-6 py-4 flex items-center gap-2">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-3 cursor-pointer text-sm font-medium text-[var(--color-heading)] dark:text-[var(--color-headingd)] hover:opacity-80 transition"
        >
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-default">
            <IoArrowBackOutline size={15} />
          </span>
          <span>Back to saved recipes</span>
        </button>
      </div>

      {/* main recipe header  */}
      <div className="px-6 pb-5 text-left">
        <h1 className="text-2xl sm:text-3xl font-semibold text-[var(--color-heading)] dark:text-[var(--color-headingd)]">
          {recipe?.title || recipe?.name || "Untitled recipe"}
        </h1>

        {recipe?.description && (
          <p className="mt-3 text-sm sm:text-base text-[var(--color-text)] dark:text-[var(--color-textd)] opacity-80 leading-relaxed">
            {recipe.description}
          </p>
        )}

        {/* display time, cuisine, and difficulty  */}
        <div className="mt-4 flex flex-wrap gap-3 text-xs sm:text-sm font-medium">
          {timeInfo.total && (
            <span className="inline-flex items-center gap-2 bg-chip px-3 py-1 rounded-full">
              ⏱ {timeInfo.total}
            </span>
          )}
          {timeInfo.breakdown && (
            <span className="inline-flex items-center gap-2 bg-chip px-3 py-1 rounded-full">
              🍳 {timeInfo.breakdown}
            </span>
          )}
          {timeInfo.prep && (
            <span className="inline-flex items-center gap-2 bg-chip px-3 py-1 rounded-full">
              🔪 Prep: {timeInfo.prep}
            </span>
          )}
          {timeInfo.cook && (
            <span className="inline-flex items-center gap-2 bg-chip px-3 py-1 rounded-full">
              🔥 Cook: {timeInfo.cook}
            </span>
          )}
          {recipe?.cuisine && (
            <span className="inline-flex items-center gap-2 bg-chip px-3 py-1 rounded-full">
              🌍 {recipe.cuisine}
            </span>
          )}
          {difficultyLabel && (
            <span className="inline-flex items-center gap-2 bg-chip px-3 py-1 rounded-full">
              🎯 {difficultyLabel}
            </span>
          )}
        </div>
      </div>

      {/* content sections */}
      <div className="px-6 pb-6 space-y-8">
        {/* ingredients */}
        <section>
          <h2 className="text-base font-semibold text-[var(--color-heading)] dark:text-[var(--color-headingd)]">
            Ingredients
          </h2>
          <ul className="mt-3 list-disc pl-5 space-y-2 text-sm sm:text-base leading-relaxed text-[var(--color-text)] dark:text-[var(--color-textd)]">
            {ingredients.length > 0
              ? ingredients.map((entry, index) => (
                  <li key={`${entry}-${index}`}>{entry}</li>
                ))
              : <li>No ingredients provided.</li>}
          </ul>
        </section>

        {/* steps */}
        <section>
          <h2 className="text-base font-semibold text-[var(--color-heading)] dark:text-[var(--color-headingd)]">
            Steps
          </h2>
          <ol className="mt-3 list-decimal pl-5 space-y-3 text-sm sm:text-base leading-relaxed text-[var(--color-text)] dark:text-[var(--color-textd)]">
            {steps.length > 0
              ? steps.map((entry, index) => (
                  <li key={`${index}-${entry}`}>{entry}</li>
                ))
              : <li>No steps provided.</li>}
          </ol>
        </section>

        {/* tags */}
        {tags.length > 0 && (
          <section className="pt-2 border-t border-dashed border-default">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-text)] dark:text-[var(--color-textd)] opacity-70">
              Tags
            </h3>
            <div className="mt-3 flex flex-wrap gap-2 text-xs font-medium text-[var(--color-text)] dark:text-[var(--color-textd)] opacity-80">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-full bg-chip px-3 py-1"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
