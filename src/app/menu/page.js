"use client";

import { useEffect, useState } from "react";
import { Button, Loader, Checkbox, Modal, Text } from "@mantine/core";
import { useRouter } from "next/navigation";
import AppHeader from "../components/AppHeader";
import MainSidebar from "../components/MainSidebar";
import RecipeCard from "../components/RecipeCard";
import BackLink from "../components/BackLink";
import { useUser } from "../components/UserContext";
import supabase from "../config/supabaseClient";

function composeBreakdown(prep, cook, fallback = "") {
  if (fallback) return fallback;
  if (prep && cook) return `${prep} prep / ${cook} cook`;
  if (prep) return `Prep: ${prep}`;
  if (cook) return `Cook: ${cook}`;
  return "";
}

function sanitizeTotalMinutes(value) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = parseInt(value, 10);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function parseInstructionsPayload(rawInstructions) {
  if (!rawInstructions) {
    return {
      steps: [],
      breakdown: "",
      cuisine: "",
      description: "",
      tags: [],
      prep_time: "",
      cook_time: "",
    };
  }

  const normalizeSteps = (input) => {
    if (!input) return [];
    if (Array.isArray(input)) return input;
    if (typeof input === "object") {
      return Object.values(input).filter(Boolean);
    }
    if (typeof input === "string") {
      return input
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);
    }
    return [];
  };

  try {
    const parsed = JSON.parse(rawInstructions);
    return {
      steps: normalizeSteps(parsed?.steps),
      breakdown: composeBreakdown(parsed?.prep_time ?? parsed?.prepTime ?? "", parsed?.cook_time ?? parsed?.cookTime ?? "", parsed?.breakdown ?? ""),
      cuisine: parsed?.cuisine ?? "",
      description: parsed?.description ?? "",
      tags: Array.isArray(parsed?.tags) ? parsed.tags : [],
      prep_time: parsed?.prep_time ?? parsed?.prepTime ?? "",
      cook_time: parsed?.cook_time ?? parsed?.cookTime ?? "",
    };
  } catch {
    if (typeof rawInstructions === "string") {
      return {
        steps: normalizeSteps(rawInstructions),
        breakdown: "",
        cuisine: "",
        description: "",
        tags: [],
        prep_time: "",
        cook_time: "",
      };
    }

    return {
      steps: [],
      breakdown: "",
      cuisine: "",
      description: "",
      tags: [],
      prep_time: "",
      cook_time: "",
    };
  }
}

export default function MenuPage() {
  const router = useRouter();
  const { user } = useUser();
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

  useEffect(() => {
    setSelectedIds((prev) => {
      const existingIds = new Set(savedRecipes.map((recipe) => recipe.id));
      const next = new Set();
      prev.forEach((id) => {
        if (existingIds.has(id)) {
          next.add(id);
        }
      });
      return next;
    });
  }, [savedRecipes]);

  const handleViewRecipe = (recipe) => {
    if (!recipe?.id) return;
    router.push(`/menu/${recipe.id}`);
  };

  const toggleSelect = (recipeId) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(recipeId)) {
        next.delete(recipeId);
      } else {
        next.add(recipeId);
      }
      return next;
    });
  };

  const selectAll = () => {
    setSelectedIds(new Set(savedRecipes.map((recipe) => recipe.id)));
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  const handleDeleteSelected = async () => {
    if (!user?.id || selectedIds.size === 0) {
      setIsDeleteModalOpen(false);
      return;
    }

    try {
      setIsDeleting(true);
      const ids = Array.from(selectedIds);
      const { error } = await supabase
        .from("saved_recipes")
        .delete()
        .in("id", ids)
        .eq("user_id", user.id);

      if (error) {
        console.error("[MenuPage] Failed to delete recipes", error);
        setErrorMessage("Could not delete the selected recipes.");
      } else {
        setSavedRecipes((current) => current.filter((recipe) => !selectedIds.has(recipe.id)));
        clearSelection();
      }
    } catch (error) {
      console.error("[MenuPage] Unexpected error while deleting recipes", error);
      setErrorMessage("Unexpected error. Please try again.");
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-app text-[var(--color-text)] dark:text-[var(--color-textd)]">
      <AppHeader />
      <main className="flex-1 flex">
        <MainSidebar className="hidden lg:flex" />
        <section className="flex-1 px-3 sm:px-5 lg:px-8 py-6 sm:py-8 lg:py-10">
          <div className="mx-auto max-w-6xl w-full space-y-6">
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

              {savedRecipes.length > 0 ? (
                <div className="flex flex-wrap items-center gap-3 pt-5">
                  <Checkbox
                   className="my-5"
                    label="Select all"
                    size="md"
                    radius="xl"
                    styles={{
                      input: {
                        cursor: "pointer",
                        transform: "scale(1.15)",
                        backgroundColor: "var(--color-surface)",
                        borderColor: "var(--color-border)",
                      },
                      icon: {
                        color: "var(--color-heading)",
                      },
                    }}
                    checked={selectedIds.size > 0 && selectedIds.size === savedRecipes.length}
                    indeterminate={selectedIds.size > 0 && selectedIds.size < savedRecipes.length}
                    onChange={(event) => {
                      if (event.currentTarget.checked) {
                        selectAll();
                      } else {
                        clearSelection();
                      }
                    }}
                  />
                  <Button
                    radius="lg"
                    size="sm"
                    variant="light"
                    onClick={clearSelection}
                    disabled={selectedIds.size === 0}
                  >
                    Clear selection
                  </Button>
                  <Button
                    radius="lg"
                    size="sm"
                    color="red"
                    disabled={selectedIds.size === 0}
                    onClick={() => setIsDeleteModalOpen(true)}
                  >
                    Delete selected
                  </Button>
                </div>
              ) : null}
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
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {savedRecipes.map((recipe) => {
                  const parsed = parseInstructionsPayload(recipe.instructions);
                  const totalMinutes = sanitizeTotalMinutes(recipe.estimated_time);
                  const breakdown = composeBreakdown(parsed.prep_time, parsed.cook_time, parsed.breakdown);

                  return (
                    <div key={recipe.id} className="relative">
                      <div className="absolute top-4 right-4 z-10">
                        <Checkbox
                          aria-label={`Select ${recipe.title}`}
                          checked={selectedIds.has(recipe.id)}
                          onChange={() => toggleSelect(recipe.id)}
                          size="sm"
                          radius="xl"
                          styles={{
                            input: {
                              cursor: "pointer",
                              transform: "scale(1.15)",
                              backgroundColor: "var(--color-surface)",
                              borderColor: "var(--color-border)",
                            },
                            icon: {
                              color: "var(--color-heading)",
                            },
                          }}
                        />
                      </div>

                      <RecipeCard
                        recipe={{
                          name: recipe.title,
                          description: parsed.description || "Saved recipe",
                          estimated_time: totalMinutes ?? recipe.estimated_time ?? null,
                          time: {
                            totalMinutes,
                            breakdown,
                            prep: parsed.prep_time,
                            cook: parsed.cook_time,
                          },
                          ingredients: recipe.ingredients,
                          steps: parsed.steps,
                          difficulty: recipe.difficulty,
                          cuisine: parsed.cuisine,
                          tags: parsed.tags,
                        }}
                        metaDifficulty={recipe.difficulty}
                        onViewRecipe={() => handleViewRecipe(recipe)}
                        viewButtonLabel="View recipe"
                        allowPreviewToggle={false}
                        className={selectedIds.has(recipe.id) ? "ring-2 ring-[#FDAA6B]" : ""}
                      />
                    </div>
                  );
                })}
              </div>
            )}

            {errorMessage && <p className="mt-4 text-sm text-red-500">{errorMessage}</p>}
          </div>
        </section>
      </main>

      <Modal
        opened={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        centered
        title="Delete selected recipes?"
      >
        <Text size="sm" mb="md">
          This will permanently remove the selected recipes from your saved menu. Are you sure you want to continue?
        </Text>
        <div className="flex justify-end gap-3">
          <Button variant="default" onClick={() => setIsDeleteModalOpen(false)} disabled={isDeleting}>
            Cancel
          </Button>
          <Button color="red" onClick={handleDeleteSelected} loading={isDeleting} disabled={selectedIds.size === 0}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
