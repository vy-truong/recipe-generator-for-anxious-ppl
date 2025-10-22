"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Tabs } from "@mantine/core";
import AppHeader from "../components/AppHeader";
import MainSidebar from "../components/MainSidebar";
import BackLink from "../components/BackLink";
import { useToast } from "../components/ToastContext";
import { useUser } from "../components/UserContext";
import supabase from "../config/supabaseClient";

const STORAGE_KEY = "fridgechef-selected";

export default function RecipePage() {
  const router = useRouter();
  const { addToast } = useToast();
  const { user } = useUser();
  const [recipeData, setRecipeData] = useState(null);
  const [activeTab, setActiveTab] = useState("ingredients");
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
  const totalMinutes =
    typeof recipe.time?.totalMinutes === "number" ? `${recipe.time.totalMinutes} mins` : "";
  const breakdown = recipe.time?.breakdown ?? "";
  const difficulty = (recipe.difficulty || meta?.difficulty || "").toString();
  const difficultyLabel =
    difficulty.length > 0 ? difficulty.charAt(0).toUpperCase() + difficulty.slice(1) : "";

  // ✅ Map difficulty values cleanly to DB-safe versions
  const mapDifficultyToSavedValue = (value) => {
    const normalized = value.toLowerCase();
    if (normalized === "easy" || normalized === "simple") return "easy";
    if (normalized === "medium") return "medium";
    if (normalized === "hard" || normalized === "advanced") return "hard";
    return "easy";
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

    const payload = {
      user_id: user.id,
      title: recipe.name,
      ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients : [],
      difficulty: formattedDifficulty,
      estimated_time: recipe.time?.totalMinutes ?? null,
      instructions: Array.isArray(recipe.steps) ? recipe.steps.join("\n") : "",
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
          <div className="mx-auto max-w-3xl bg-surface border border-default shadow-lg rounded-3xl overflow-hidden">
            <div className="px-6 py-4">
              <BackLink href="/results" />
            </div>
            <div className="px-6 pb-5 text-left">
              <h1 className="text-2xl sm:text-3xl font-semibold text-[var(--color-heading)] dark:text-[var(--color-headingd)]">
                {recipe.name}
              </h1>
              <p className="mt-3 text-sm sm:text-base opacity-80">{recipe.description}</p>
              <div className="mt-4 flex flex-wrap gap-3 text-xs sm:text-sm font-medium">
                {totalMinutes && <span className="bg-chip px-3 py-1 rounded-full">⏱ {totalMinutes}</span>}
                {breakdown && <span className="bg-chip px-3 py-1 rounded-full">🍳 {breakdown}</span>}
                {recipe.cuisine && <span className="bg-chip px-3 py-1 rounded-full">🌍 {recipe.cuisine}</span>}
                {difficultyLabel && (
                  <span className="bg-chip px-3 py-1 rounded-full">🎯 {difficultyLabel}</span>
                )}
              </div>
            </div>

            <div className="px-6 py-5">
              <Tabs value={activeTab} onChange={setActiveTab} radius="xl" variant="pills" className="mb-6">
                <Tabs.List grow>
                  <Tabs.Tab value="ingredients">Ingredients</Tabs.Tab>
                  <Tabs.Tab value="steps">Steps</Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="ingredients" pt="md">
                  <ul className="list-disc pl-6 space-y-3 text-sm sm:text-base">
                    {recipe.ingredients?.map((entry, index) => {
                      const label =
                        typeof entry === "string"
                          ? entry
                          : `${entry.quantity ? `${entry.quantity} ` : ""}${entry.item ?? ""}`.trim();
                      return <li key={`${label}-${index}`}>{label}</li>;
                    })}
                  </ul>
                </Tabs.Panel>

                <Tabs.Panel value="steps" pt="md">
                  <ol className="list-decimal pl-6 space-y-3 text-sm sm:text-base">
                    {recipe.steps?.map((step, index) => <li key={index}>{step}</li>)}
                  </ol>
                </Tabs.Panel>
              </Tabs>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Button
                  fullWidth
                  radius="lg"
                  size="md"
                  className="bg-[#FDAA6B] hover:bg-[#f68f3c] text-white"
                  loading={isSaving}
                  onClick={handleSaveRecipe}
                >
                  Save to My Menu
                </Button>
                <Button fullWidth radius="lg" size="md" variant="outline" onClick={() => router.push("/results")}>
                  Try Another Dish
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
