"use client";

import { useEffect, useState } from "react";
import { Button, Loader } from "@mantine/core";
import { useRouter } from "next/navigation";
import AppHeader from "../components/AppHeader";
import MainSidebar from "../components/MainSidebar";
import { useUser } from "../components/UserContext";
import supabase from "../config/supabaseClient";

const SELECTED_STORAGE_KEY = "fridgechef-selected";

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

  const handleViewRecipe = (recipe) => {
    if (!recipe) return;

    const hydratedRecipe = {
      recipe: {
        name: recipe.title,
        description: "Saved recipe",
        time: { totalMinutes: recipe.estimated_time, breakdown: "" },
        ingredients: recipe.ingredients ?? [],
        steps: recipe.instructions ? recipe.instructions.split("\n") : [],
        difficulty: recipe.difficulty,
        cuisine: "",
      },
      meta: { difficulty: recipe.difficulty },
    };

    sessionStorage.setItem(SELECTED_STORAGE_KEY, JSON.stringify(hydratedRecipe));
    router.push("/recipe");
  };

  return (
    <div className="min-h-screen flex flex-col bg-app text-[var(--color-text)] dark:text-[var(--color-textd)]">
      <AppHeader />
      <main className="flex-1 flex">
        <MainSidebar className="hidden lg:flex" />
        <section className="flex-1 px-4 sm:px-6 py-10 sm:py-12 lg:py-16">
          <div className="mx-auto max-w-4xl">
            <header className="space-y-2 mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-heading)] dark:text-[var(--color-headingd)]">
                My Saved Recipes
              </h1>
              <p className="text-sm sm:text-base opacity-80">
                Recipes you have saved from the generator appear here.
              </p>
            </header>

            {!user?.id ? (
              <p className="text-sm sm:text-base opacity-80">Please log in to view and save recipes.</p>
            ) : isLoading ? (
              <div className="flex items-center gap-3 text-sm sm:text-base opacity-80">
                <Loader size="sm" /> Loading your recipes…
              </div>
            ) : savedRecipes.length === 0 ? (
              <p className="text-sm sm:text-base opacity-80">You do not have any saved recipes yet.</p>
            ) : (
              <ul className="space-y-4">
                {savedRecipes.map((recipe) => (
                  <li
                    key={recipe.id}
                    className="bg-surface border border-default rounded-2xl shadow-sm p-5 flex flex-col gap-3"
                  >
                    <div>
                      <h2 className="text-lg sm:text-xl font-semibold text-[var(--color-heading)] dark:text-[var(--color-headingd)]">
                        {recipe.title}
                      </h2>
                      <p className="text-xs sm:text-sm opacity-70 mt-1">
                        Saved on {new Date(recipe.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs sm:text-sm opacity-80">
                      {recipe.estimated_time && <span>⏱ {recipe.estimated_time} mins</span>}
                      {recipe.difficulty && (
                        <span>🎯 {recipe.difficulty.charAt(0).toUpperCase() + recipe.difficulty.slice(1)}</span>
                      )}
                    </div>
                    <Button radius="lg" size="sm" variant="outline" onClick={() => handleViewRecipe(recipe)}>
                      View recipe
                    </Button>
                  </li>
                ))}
              </ul>
            )}

            {errorMessage && <p className="mt-4 text-sm text-red-500">{errorMessage}</p>}
          </div>
        </section>
      </main>
    </div>
  );
}
