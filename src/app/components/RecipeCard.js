"use client";

import { useMemo, useState } from "react";
import { Modal } from "@mantine/core";

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
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

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
      className={`rounded-3xl border border-default bg-surface dark:bg-gradient-main shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${className}`}
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
              onClick={() => setIsPreviewOpen(true)}
              className="inline-flex w-full sm:w-auto items-center justify-between rounded-2xl bg-[#FDAA6B] px-5 py-3 text-sm font-semibold text-white shadow hover:opacity-90 transition"
            >
              Quick preview
              <span className="text-base">→</span>
            </button>
          ) : null}

          <button
            type="button"
            onClick={onViewRecipe}
            className="group relative inline-flex w-full sm:w-auto items-center justify-center rounded-2xl border border-default px-5 py-3 text-sm font-semibold text-[var(--color-heading)] dark:text-[var(--color-headingd)] bg-surface dark:bg-[var(--color-surfaced)] transition focus:outline-none hover:border-[var(--color-heading)] dark:hover:border-[var(--color-headingd)]"
          >
            <span className="absolute inset-0 rounded-2xl opacity-0 blur-xl transition duration-300 group-hover:opacity-80 group-hover:bg-white/70 dark:group-hover:bg-[var(--color-headingd)]/35" />
            <span className="relative">{viewButtonLabel}</span>
          </button>
        </div>
      </div>

      <Modal
        opened={allowPreviewToggle && isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title="Quick preview"
        centered
        radius="lg"
        overlayProps={{ opacity: 0.35, blur: 2 }}
      >
        <div className="space-y-6 text-[var(--color-text)] dark:text-[var(--color-textd)]">
          <section>
            <h3 className="text-sm font-semibold uppercase tracking-wide opacity-70">Ingredients</h3>
            <ul className="mt-3 list-disc pl-5 space-y-3 text-sm sm:text-base">
              {ingredients.length > 0
                ? ingredients.map((ingredient, index) => <li key={index}>{ingredient}</li>)
                : <li>No ingredients provided.</li>}
            </ul>
          </section>
          <section>
            <h3 className="text-sm font-semibold uppercase tracking-wide opacity-70">Steps</h3>
            <ol className="mt-3 list-decimal pl-5 space-y-3 text-sm leading-relaxed">
              {steps.length > 0
                ? steps.map((step, index) => <li key={index}>{step}</li>)
                : <li>No steps provided.</li>}
            </ol>
          </section>
        </div>
      </Modal>
    </article>
  );
}
