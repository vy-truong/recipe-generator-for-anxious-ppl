"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AppHeader from "../components/AppHeader";
import MainSidebar from "../components/MainSidebar";
import RecipeCard from "../components/RecipeCard";

const STORAGE_KEY = "fridgechef-results";

export default function ResultsPage() {
  const router = useRouter();
  const [isHydrated, setIsHydrated] = useState(false);
  const [recipes, setRecipes] = useState([]);
  const [meta, setMeta] = useState({ difficulty: "", ingredients: [] });

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
            {recipes.map((recipe, index) => (
              <RecipeCard
                key={`${recipe.name}-${index}`}
                recipe={recipe}
                metaDifficulty={meta.difficulty}
                onViewRecipe={() => {
                  if (typeof window !== "undefined") {
                    const serialized = JSON.stringify({ recipe, meta });
                    sessionStorage.setItem("fridgechef-selected", serialized);
                    try {
                      localStorage.setItem("fridgechef-selected", serialized);
                    } catch (error) {
                      console.warn("[ResultsPage] Unable to persist selected recipe", error);
                    }
                  }
                  router.push("/recipe");
                }}
                allowPreviewToggle
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
