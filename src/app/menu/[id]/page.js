"use client";

import { use, useEffect, useState } from "react";
import { Loader } from "@mantine/core";
import { useRouter } from "next/navigation";
import AppHeader from "../../components/AppHeader";
import MainSidebar from "../../components/MainSidebar";
import SavedRecipeDetail from "../../components/SavedRecipeDetail";
import { useUser } from "../../components/UserContext";
import { useToast } from "../../components/ToastContext";
import supabase from "../../config/supabaseClient";

const DEFAULT_RECIPE_STATE = {
  title: "",
  description: "",
  ingredients: [],
  instructions: [],
  estimated_time: null,
  breakdown: "",
  prep_time: "",
  cook_time: "",
  difficulty: "",
  cuisine: "",
  tags: [],
};

function parseStoredRecipe(record) {
  if (!record) return DEFAULT_RECIPE_STATE;

  const parsedInstructions = (() => {
    if (!record.instructions) return {};

    try {
      const parsed = JSON.parse(record.instructions);
      return typeof parsed === "object" && parsed !== null ? parsed : {};
    } catch {
      if (typeof record.instructions === "string") {
        return { steps: record.instructions.split(/\r?\n/).filter(Boolean) };
      }
      return {};
    }
  })();

  const normalizeList = (value) => {
    if (Array.isArray(value)) return value;
    if (typeof value === "string") {
      return value
        .split(/\r?\n|,/)
        .map((entry) => entry.trim())
        .filter(Boolean);
    }
    return [];
  };

  return {
    title: record.title,
    description: parsedInstructions.description || record.description || "",
    ingredients: record.ingredients ?? [],
    instructions: parsedInstructions.steps ?? normalizeList(record.instructions),
    estimated_time: record.estimated_time ?? null,
    breakdown: parsedInstructions.breakdown || "",
    prep_time: parsedInstructions.prep_time || parsedInstructions.prepTime || "",
    cook_time: parsedInstructions.cook_time || parsedInstructions.cookTime || "",
    difficulty: record.difficulty || "",
    cuisine: parsedInstructions.cuisine || "",
    tags: Array.isArray(parsedInstructions.tags) ? parsedInstructions.tags : [],
  };
}

export default function SavedRecipePage({ params }) {
  const router = useRouter();
  const { addToast } = useToast();
  const { user, refreshUser } = useUser();
  const [recipe, setRecipe] = useState(DEFAULT_RECIPE_STATE);
  const [isLoading, setIsLoading] = useState(true);

  const { id: recipeId } = use(params);

  useEffect(() => {
    let isMounted = true;

    const loadRecipe = async () => {
      if (!recipeId) {
        router.replace("/menu");
        return;
      }

      let activeUserId = user?.id ?? null;

      if (!activeUserId) {
        await refreshUser();
        try {
          const { data: sessionData } = await supabase.auth.getSession();
          activeUserId = sessionData?.session?.user?.id ?? null;
        } catch (error) {
          console.error("[SavedRecipePage] Failed retrieving session", error);
        }
      }

      if (!activeUserId) {
        addToast({ type: "error", message: "Please log in to view your saved recipes." });
        router.replace("/login");
        return;
      }

      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("saved_recipes")
          .select("id, title, ingredients, difficulty, estimated_time, instructions, created_at")
          .eq("id", recipeId)
          .eq("user_id", activeUserId)
          .single();

        if (error) {
          console.error("[SavedRecipePage] Failed to fetch recipe", error);
          addToast({ type: "error", message: "Could not load this saved recipe." });
          router.replace("/menu");
          return;
        }

        if (isMounted) {
          setRecipe(parseStoredRecipe(data));
        }
      } catch (error) {
        console.error("[SavedRecipePage] Unexpected error loading saved recipe", error);
        addToast({ type: "error", message: "Unexpected error. Please try again." });
        router.replace("/menu");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadRecipe();

    return () => {
      isMounted = false;
    };
  }, [recipeId, user, refreshUser, addToast, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-app text-[var(--color-text)] dark:text-[var(--color-textd)]">
        <Loader size="md" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-app text-[var(--color-text)] dark:text-[var(--color-textd)]">
      <AppHeader />
      <main className="flex-1 flex">
        <MainSidebar className="hidden lg:flex" />
        <section className="flex-1 px-3 sm:px-5 lg:px-8 py-6 sm:py-8 lg:py-10 flex items-center justify-center">
          <div className="w-full max-w-4xl">
            <SavedRecipeDetail recipe={recipe} onBack={() => router.push("/menu")} />
          </div>
        </section>
      </main>
    </div>
  );
}
