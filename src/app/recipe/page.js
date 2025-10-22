"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppHeader from "../components/AppHeader";
import MainSidebar from "../components/MainSidebar";
import RecipeDetail from "../components/RecipeDetail";
import { useToast } from "../components/ToastContext";
import { useUser } from "../components/UserContext";
import supabase from "../config/supabaseClient";

const STORAGE_KEY = "fridgechef-selected";

export default function RecipePage() {
  const router = useRouter();
  const { addToast } = useToast();
  const { user } = useUser();
  const [recipeData, setRecipeData] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // ──────────────────────────────
  // Load selected recipe from sessionStorage
  // ──────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (!stored) {
        router.replace("/results");
        return;
      }

      const parsed = JSON.parse(stored);
      if (!parsed?.recipe) {
        router.replace("/results");
        return;
      }

      setRecipeData(parsed);
    } catch (error) {
      console.error("Failed to load selected recipe", error);
      router.replace("/results");
    }
  }, [router]);

  if (!recipeData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-app text-[var(--color-text)] dark:text-[var(--color-textd)]">
        Loading recipe…
      </div>
    );
  }

  const { recipe, meta } = recipeData;

  const mapDifficultyToSavedValue = (value) => {
    const normalized = value.toLowerCase();
    if (normalized === "easy" || normalized === "simple") return "Simple";
    if (normalized === "medium") return "Medium";
    if (normalized === "hard" || normalized === "advanced") return "Hard";
    return "Simple";
  };

  // ──────────────────────────────
  // Save recipe to Supabase
  // ──────────────────────────────
  const handleSaveRecipe = async () => {
    if (!user?.id) {
      addToast({ type: "error", message: "Please log in to save recipes." });
      router.push("/login");
      return;
    }

    const formattedDifficulty = mapDifficultyToSavedValue(recipe.difficulty || meta?.difficulty || "");

    // include description, cuisine, breakdown, prep/cook time
    const instructionsData = {
      steps: Array.isArray(recipe.steps) ? recipe.steps : [],
      breakdown: recipe.time?.breakdown ?? "",
      cuisine: recipe.cuisine ?? "",
      description: recipe.description ?? "",
      tags: recipe.tags ?? [],
      prep_time: recipe.time?.prep ?? "",
      cook_time: recipe.time?.cook ?? "",
    };

    const payload = {
      user_id: user.id,
      title: recipe.name,
      ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients : [],
      difficulty: formattedDifficulty,
      estimated_time: recipe.time?.totalMinutes ?? null,
      instructions: JSON.stringify(instructionsData),
    };

    try {
      setIsSaving(true);
      const { error } = await supabase.from("saved_recipes").insert([payload]);

      if (error) {
        console.error("[RecipePage] Failed to save recipe", error);
        addToast({ type: "error", message: "Could not save recipe. Please try again." });
      } else {
        console.log("[RecipePage] Recipe saved", payload);
        addToast({ type: "success", message: "Recipe saved to your menu!" });
      }
    } catch (error) {
      console.error("[RecipePage] Unexpected error while saving recipe", error);
      addToast({ type: "error", message: "Unexpected error. Please try again." });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-app text-[var(--color-text)] dark:text-[var(--color-textd)]">
      <AppHeader />
      <main className="flex-1 flex">
        <MainSidebar className="hidden lg:flex" />
        <section className="flex-1 px-4 sm:px-6 py-10 sm:py-12 lg:py-16">
          <RecipeDetail
            recipe={recipe}
            metaDifficulty={meta?.difficulty}
            backLinkHref="/results"
            isSaving={isSaving}
            onSave={handleSaveRecipe}
            onTryAnother={() => router.push("/results")}
          />
        </section>
      </main>
    </div>
  );
}
