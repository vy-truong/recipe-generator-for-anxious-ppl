"use client";

import { useMemo, useState } from "react";

function normalizeDifficulty(value) {
  if (!value) return "";
  const normalized = value.toString().toLowerCase();
  if (normalized === "easy" || normalized === "simple") return "Simple";
  if (normalized === "medium") return "Medium";
  if (normalized === "hard" || normalized === "advanced") return "Hard";
  return value;
}

function ensureArray(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === "string" && value.trim().length > 0) {
    return value
      .split(/\r?\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

export default function RecipeCard({
  recipe,
  metaDifficulty,
  onViewRecipe,
  viewButtonLabel = "View full recipe",
  allowPreviewToggle = true,
  className = "",
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const totalMinutes = useMemo(() => {
    if (typeof recipe?.time?.totalMinutes === "number") {
      return `${recipe.time.totalMinutes} mins`;
    }
    if (typeof recipe?.estimated_time === "number") {
      return `${recipe.estimated_time} mins`;
    }
    return "";
  }, [recipe]);

  const breakdown = recipe?.time?.breakdown ?? recipe?.breakdown ?? "";
  const difficultyLabel = normalizeDifficulty(recipe?.difficulty || metaDifficulty || "");
  const ingredients = ensureArray(recipe?.ingredients);
  const steps = ensureArray(recipe?.steps ?? recipe?.instructions);
  const tags = Array.isArray(recipe?.tags) ? recipe.tags : [];

  return (
    <article
      className={`rounded-3xl border border-default bg-surface shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${className}`}
    >
      <div className="p-5 sm:p-6">
        <div className="flex flex-col gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-[var(--color-heading)] dark:text-[var(--color-headingd)]">
              {recipe?.name || recipe?.title || "Untitled recipe"}
            </h2>
            <div className="mt-2 text-left text-sm sm:text-base text-[var(--color-text)] dark:text-[var(--color-textd)] opacity-80 space-y-2">
              {totalMinutes ? <p>⏱ {totalMinutes}</p> : null}
              {breakdown ? <p>🍳 {breakdown}</p> : null}
              {recipe?.cuisine ? <p>🌍 {recipe.cuisine}</p> : null}
              {difficultyLabel ? <p>🎯 {difficultyLabel}</p> : null}
            </div>
            {recipe?.description ? (
              <p className="mt-3 text-sm sm:text-base text-[var(--color-text)] dark:text-[var(--color-textd)] opacity-85 leading-relaxed">
                {recipe.description}
              </p>
            ) : null}
          </div>
        </div>

        {tags.length > 0 ? (
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-medium text-[var(--color-text)] dark:text-[var(--color-textd)] opacity-70">
            {tags.map((tag) => (
              <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-chip px-3 py-1">
                #{tag}
              </span>
            ))}
          </div>
        ) : null}

        <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {allowPreviewToggle ? (
            <button
              type="button"
              onClick={() => setIsExpanded((value) => !value)}
              className="inline-flex w-full sm:w-auto items-center justify-between rounded-2xl bg-[#FDAA6B] px-5 py-3 text-sm font-semibold text-white shadow hover:opacity-90 transition"
            >
              {isExpanded ? "Hide preview" : "Quick preview"}
              <span className="text-base">{isExpanded ? "↑" : "→"}</span>
            </button>
          ) : null}

          <button
            type="button"
            onClick={onViewRecipe}
            className="inline-flex w-full sm:w-auto items-center justify-center rounded-2xl border border-default px-5 py-3 text-sm font-semibold text-[var(--color-heading)] hover:opacity-90 transition"
          >
            {viewButtonLabel}
          </button>
        </div>
      </div>

      {allowPreviewToggle && isExpanded ? (
        <div className="border-t border-default bg-surface p-5 sm:p-6">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-text)] dark:text-[var(--color-textd)] opacity-70">
              Ingredients
            </h3>
              {/* Render each ingredient safely */}
              <ul className="list-disc pl-6 space-y-3 text-sm sm:text-base">
                {ingredients.length > 0 ? (
                  ingredients.map((ingredient, index) => {
                    // If ingredient is an object with "item" and "quantity"
                    if (typeof ingredient === "object" && ingredient !== null) {
                      const name = ingredient.item || "Unknown item";
                      const quantity = ingredient.quantity ? ` (${ingredient.quantity})` : "";
                      return <li key={index}>{`${name}${quantity}`}</li>;
                    }
                    // Otherwise assume it’s a string
                    return <li key={index}>{ingredient}</li>;
                  })
                ) : (
                  <li>No ingredients provided.</li>
                )}
              </ul>
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-text)] dark:text-[var(--color-textd)] opacity-70">
              Steps
            </h3>
            <ol className="mt-3 list-decimal space-y-3 pl-4 sm:pl-5 text-sm leading-relaxed text-[var(--color-text)] dark:text-[var(--color-textd)] opacity-85">
              {steps.length > 0
                ? steps.map((step, index) => <li key={index}>{step}</li>)
                : <li>No steps provided.</li>}
            </ol>
          </div>
        </div>
      ) : null}
    </article>
  );
}
