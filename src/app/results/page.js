"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AppHeader from "../components/AppHeader";
import MainSidebar from "../components/MainSidebar";

const STORAGE_KEY = "fridgechef-results";

export default function ResultsPage() {
  const router = useRouter();
  const [isHydrated, setIsHydrated] = useState(false);
  const [recipes, setRecipes] = useState([]);
  const [meta, setMeta] = useState({ difficulty: "", ingredients: [] });
  const [expandedIndex, setExpandedIndex] = useState(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (!stored) {
        router.replace("/");
        return;
      }

      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed?.recipes) || !parsed.recipes.length) {
        router.replace("/");
        return;
      }

      setRecipes(parsed.recipes);
      setMeta({
        difficulty: parsed.meta?.difficulty ?? "",
        ingredients: parsed.meta?.ingredients ?? [],
      });
      setIsHydrated(true);
    } catch (error) {
      console.error("Failed to load stored recipes:", error);
      router.replace("/");
    }
  }, [router]);

  const difficultyLabel = useMemo(() => {
    if (!meta.difficulty) return "";
    return meta.difficulty.charAt(0).toUpperCase() + meta.difficulty.slice(1);
  }, [meta.difficulty]);

  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-app text-[var(--color-text)] dark:text-[var(--color-textd)]">
        <p className="text-base font-medium animate-pulse">Plating your recipes…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-app text-[var(--color-text)] dark:text-[var(--color-textd)]">
      <AppHeader />

      <main className="flex-1 flex">
        <MainSidebar className="hidden lg:flex" />
        <section className="flex-1 mx-auto max-w-5xl px-4 sm:px-6 py-10 sm:py-12 lg:py-16">
          <header className="max-w-3xl space-y-4">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-[var(--color-heading)] dark:text-[var(--color-headingd)]">
              Here’s what you can make! 🎉
            </h1>
            <p className="text-sm sm:text-base text-[var(--color-text)] dark:text-[var(--color-textd)] opacity-80 leading-relaxed">
              Tap a dish to see the detailed recipe. Each option celebrates your ingredients and matches the{" "}
              <span className="font-semibold lowercase">{meta.difficulty}</span> vibe you picked.
            </p>
            {meta.ingredients?.length ? (
              <div className="flex flex-wrap gap-2">
                {meta.ingredients.map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-1 rounded-full bg-chip px-3 py-1 text-xs uppercase tracking-wide text-[var(--color-heading-hl)]"
                  >
                    {item}
                  </span>
                ))}
              </div>
            ) : null}
            {difficultyLabel ? (
              <p className="text-xs uppercase tracking-wide text-[var(--color-text)] dark:text-[var(--color-textd)] opacity-60">
                Difficulty: <span className="font-semibold capitalize">{meta.difficulty}</span>
              </p>
            ) : null}
          </header>

          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {recipes.map((recipe, index) => {
              const isExpanded = expandedIndex === index;
              const totalMinutes =
                typeof recipe.time?.totalMinutes === "number" ? `${recipe.time.totalMinutes} mins` : null;
              const breakdown = recipe.time?.breakdown;
              const dishDifficulty = (recipe.difficulty || meta.difficulty || "").toString();
              const formattedDifficulty =
                dishDifficulty.length > 0
                  ? dishDifficulty.charAt(0).toUpperCase() + dishDifficulty.slice(1)
                  : "";

              return (
                <article
                  key={`${recipe.name}-${index}`}
                  className="rounded-3xl border border-default bg-surface shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="p-5 sm:p-6">
                    <div className="flex flex-col gap-3">
                      <div>
                        <h2 className="text-lg sm:text-xl font-semibold text-[var(--color-heading)]">{recipe.name}</h2>
                        <div className="mt-2 text-left text-sm sm:text-base text-[var(--color-text)] dark:text-[var(--color-textd)] opacity-80 space-y-2">
                          {totalMinutes ? <p>⏱ {totalMinutes}</p> : null}
                          {breakdown ? <p>🍳 {breakdown}</p> : null}
                          {recipe.cuisine ? <p>🌍 {recipe.cuisine}</p> : null}
                          {formattedDifficulty ? <p>🎯 {formattedDifficulty}</p> : null}
                        </div>
                        <p className="mt-3 text-sm sm:text-base text-[var(--color-text)] dark:text-[var(--color-textd)] opacity-85 leading-relaxed">
                          {recipe.description}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => setExpandedIndex(isExpanded ? null : index)}
                        className="inline-flex w-full sm:w-auto items-center justify-between rounded-2xl bg-[#FDAA6B] px-5 py-3 text-sm font-semibold text-white shadow hover:opacity-90 transition"
                      >
                        {isExpanded ? "Hide preview" : "Quick preview"}
                        <span className="text-base">{isExpanded ? "↑" : "→"}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (typeof window !== "undefined") {
                            sessionStorage.setItem(
                              "fridgechef-selected",
                              JSON.stringify({ recipe, meta })
                            );
                          }
                          router.push("/recipe");
                        }}
                        className="inline-flex w-full sm:w-auto items-center justify-center rounded-2xl border border-default px-5 py-3 text-sm font-semibold text-[var(--color-heading)] hover:opacity-90 transition"
                      >
                        View full recipe
                      </button>
                    </div>
                  </div>

                  {isExpanded ? (
                    <div className="border-t border-default bg-surface p-5 sm:p-6">
                      <div>
                        <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-text)] dark:text-[var(--color-textd)] opacity-70">
                          Ingredients
                        </h3>
                        <ul className="mt-3 list-disc space-y-2 pl-4 sm:pl-5 text-sm text-[var(--color-text)] dark:text-[var(--color-textd)] opacity-85">
                          {Array.isArray(recipe.ingredients)
                            ? recipe.ingredients.map((entry, itemIndex) => {
                                const ingredientLabel =
                                  typeof entry === "string"
                                    ? entry
                                    : `${entry.quantity ? `${entry.quantity} ` : ""}${entry.item ?? ""}`.trim();
                                return <li key={`${ingredientLabel}-${itemIndex}`}>{ingredientLabel}</li>;
                              })
                            : null}
                        </ul>
                      </div>

                      <div className="mt-6">
                        <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-text)] dark:text-[var(--color-textd)] opacity-70">
                          Steps
                        </h3>
                        <ol className="mt-3 list-decimal space-y-3 pl-4 sm:pl-5 text-sm leading-relaxed text-[var(--color-text)] dark:text-[var(--color-textd)] opacity-85">
                          {Array.isArray(recipe.steps)
                            ? recipe.steps.map((step, stepIndex) => <li key={stepIndex}>{step}</li>)
                            : null}
                        </ol>
                      </div>

                      {recipe.proTip ? (
                        <p className="mt-5 rounded-2xl border border-dashed border-default bg-surface px-4 py-3 text-sm text-[var(--color-headingd)] dark:text-[var(--color-headingd)]">
                          💡 {recipe.proTip}
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
