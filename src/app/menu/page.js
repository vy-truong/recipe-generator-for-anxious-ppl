"use client";

import { useEffect, useState } from "react";
import { Button, Loader } from "@mantine/core";
import { useRouter } from "next/navigation";
import AppHeader from "../components/AppHeader";
import MainSidebar from "../components/MainSidebar";
import RecipeCard from "../components/RecipeCard";
import BackLink from "../components/BackLink";
import { useUser } from "../components/UserContext";
import supabase from "../config/supabaseClient";

const STORAGE_KEY = "fridgechef-results";

export default function MenuPage() {
  const router = useRouter();
  const { user } = useUser();
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchSavedRecipes = async () => {
      if (!user?.id) {
        setIsLoading(false);
        setSavedRecipes([]);
        return;
      }

      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("saved_recipes")
          .select("id, title, ingredients, difficulty, estimated_time, instructions, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("[MenuPage] Failed to fetch recipes", error);
          setErrorMessage("Could not load saved recipes.");
          setSavedRecipes([]);
        } else {
          setSavedRecipes(data ?? []);
        }
      } catch (error) {
        console.error("[MenuPage] Unexpected error while retrieving saved recipes", error);
        setErrorMessage("Unexpected error loading recipes.");
        setSavedRecipes([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSavedRecipes();
  }, [user]);

  const parseInstructions = (rawInstructions) => {
    if (!rawInstructions) return {};
  
    try {
      const parsed = JSON.parse(rawInstructions);
      return {
        steps: Array.isArray(parsed?.steps) ? parsed.steps : [],
        breakdown: parsed?.breakdown ?? "",
        cuisine: parsed?.cuisine ?? "",
        description: parsed?.description ?? "",
        tags: parsed?.tags ?? [],
        prep_time: parsed?.prep_time ?? "",
        cook_time: parsed?.cook_time ?? "",
      };
    } catch {
      return { steps: [], breakdown: "", cuisine: "", description: "" };
    }
  };
  

  const handleViewRecipe = (recipe) => {
    if (!recipe) return;

    const parsedInstructions = parseInstructions(recipe.instructions);
    const hydratedRecipe = {
      recipe: {
        name: recipe.title,
        description: parsedInstructions.description || recipe.description || "Saved recipe",
        time: { totalMinutes: recipe.estimated_time, breakdown: parsedInstructions.breakdown },
        ingredients: recipe.ingredients ?? [],
        steps: parsedInstructions.steps,
        difficulty: recipe.difficulty,
        cuisine: parsedInstructions.cuisine,
      },
      meta: { difficulty: recipe.difficulty },
    };

    if (typeof window !== "undefined") {
      const serialized = JSON.stringify(hydratedRecipe);
      sessionStorage.setItem(STORAGE_KEY, serialized);
      try {
        localStorage.setItem(STORAGE_KEY, serialized);
      } catch (error) {
        console.warn("[MenuPage] Unable to persist selected recipe", error);
      }
    }

    router.push("/recipe");
  };

  return (
    <div className="min-h-screen flex flex-col bg-app text-[var(--color-text)] dark:text-[var(--color-textd)]">
      <AppHeader />
      <main className="flex-1 flex">
        <MainSidebar className="hidden lg:flex" />
        <section className="flex-1 px-4 sm:px-6 py-10 sm:py-12 lg:py-16">
          <div className="mx-auto max-w-4xl">
            <header className="space-y-3 mb-8">
              <BackLink href="/results" />
              <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-heading)] dark:text-[var(--color-headingd)]">
                My Saved Recipes
              </h1>
              <p className="text-sm sm:text-base opacity-80">
                Recipes you have saved from the generator appear here.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  radius="lg"
                  size="md"
                  className="bg-[#FDAA6B] hover:bg-[#f68f3c] text-white"
                  onClick={() => router.push("/results")}
                >
                  Add more dishes
                </Button>
                <Button
                  radius="lg"
                  size="md"
                  variant="outline"
                  onClick={() => router.push("/")}
                >
                  Generate new dish
                </Button>
              </div>
            </header>

            {!user?.id ? (
              <p className="text-sm sm:text-base opacity-80">Please log in to view and save recipes.</p>
            ) : isLoading ? (
              <div className="flex items-center gap-3 text-sm sm:text-base opacity-80">
                <Loader size="sm" /> Loading your recipes…
              </div>
            ) : savedRecipes.length === 0 ? (
              <div className="space-y-4">
                <p className="text-sm sm:text-base opacity-80">You do not have any saved recipes yet.</p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2">
                {savedRecipes.map((recipe) => {
                  const parsedInstructions = parseInstructions(recipe.instructions);

                  return (
                    <RecipeCard
                      key={recipe.id}
                      recipe={{
                        name: recipe.title,
                        description: parsedInstructions.description,
                        estimated_time: recipe.estimated_time,
                        ingredients: recipe.ingredients,
                        instructions: parsedInstructions.steps,
                        breakdown: parsedInstructions.breakdown,
                        cuisine: parsedInstructions.cuisine,
                        tags: parsedInstructions.tags,
                        prep_time: parsedInstructions.prep_time,
                        cook_time: parsedInstructions.cook_time,
                        difficulty: recipe.difficulty,
                      }}
                      metaDifficulty={recipe.difficulty}
                      onViewRecipe={() => handleViewRecipe(recipe)}
                      viewButtonLabel="View recipe"
                      allowPreviewToggle={false}
                    />

                  );
                })}
              </div>
            )}

            {errorMessage && <p className="mt-4 text-sm text-red-500">{errorMessage}</p>}
          </div>
        </section>
      </main>
    </div>
  );
}
