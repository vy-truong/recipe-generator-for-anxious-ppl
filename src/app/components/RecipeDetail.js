"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Tabs } from "@mantine/core";
import BackLink from "./BackLink";
import RecipeDetailActions from "./RecipeDetailActions";
import { IoArrowBackOutline } from "react-icons/io5";

function normalizeDifficulty(value) {
  if (!value) return "";
  const normalized = value.toString().toLowerCase();
  if (normalized === "easy" || normalized === "simple") return "Simple";
  if (normalized === "medium") return "Medium";
  if (normalized === "hard" || normalized === "advanced") return "Hard";
  return value;
}

// ──────────────────────────────
// Convert recipe fields into a clean array of strings
// ──────────────────────────────
function formatEntry(entry, role) {
  if (entry == null) return "";

  let resolved = entry;

  if (typeof entry === "string") {
    const trimmed = entry.trim();
    if (!trimmed) return "";

    // Strings that look like JSON objects are parsed so we can extract fields.
    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      try {
        resolved = JSON.parse(trimmed);
      } catch {
        // If JSON.parse fails we just return the original string
        return trimmed;
      }
    } else {
      return trimmed;
    }
  }

  if (typeof resolved === "object") {
    const candidate =
      resolved.item ||
      resolved.name ||
      resolved.title ||
      resolved.step ||
      resolved.instruction ||
      resolved.text ||
      "";

    const quantity =
      resolved.quantity ??
      resolved.amount ??
      resolved.measure ??
      resolved.stepNumber ??
      resolved.time ??
      "";

    if (role === "step") {
      if (typeof resolved === "object") {
        const pieces = [
          typeof resolved.stepNumber !== "undefined" ? `Step ${resolved.stepNumber}:` : "",
          resolved.text || resolved.instruction || resolved.description || candidate,
        ]
          .map((piece) => (piece || "").trim())
          .filter(Boolean);

        return pieces.join(" ");
      }
      return String(resolved);
    }

    if (candidate) {
      const qtyText = quantity ? ` (${quantity})` : "";
      return `${candidate}${qtyText}`.trim();
    }
  }

  return String(resolved);
}

function toArray(value, role = "ingredient") {
  if (Array.isArray(value)) {
    return value
      .map((entry) => formatEntry(entry, role))
      .map((entry) => entry.trim())
      .filter(Boolean);
  }

  if (typeof value === "string" && value.trim().length > 0) {
    return value
      .split(/\r?\n|,/)
      .map((entry) => formatEntry(entry, role))
      .map((entry) => entry.trim())
      .filter(Boolean);
  }

  if (typeof value === "object" && value !== null) {
    return [formatEntry(value, role)].filter(Boolean);
  }

  return [];
}


export default function RecipeDetail({
  recipe,
  metaDifficulty,
  backLinkHref,
  isSaving = false,
  onSave,
  onTryAnother,
}) {
  const [activeTab, setActiveTab] = useState("ingredients");

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
  const ingredients = toArray(recipe?.ingredients, "ingredient");
  const steps = toArray(recipe?.steps ?? recipe?.instructions, "step");
  const router = useRouter();

  return (
    <div className="mx-auto max-w-3xl bg-surface border border-default shadow-lg rounded-3xl overflow-hidden">
      {/* back link */}
      <div
          className="px-6 py-4 flex items-center gap-2 cursor-pointer text-[var(--color-heading)] hover:opacity-80 transition"
          onClick={() => router.back()}
        >
          <IoArrowBackOutline size={20} />
          <span className="text-sm sm:text-base font-medium">Back</span>
      </div>
      <div className="px-6 pb-5 text-left">
        <h1 className="text-2xl sm:text-3xl font-semibold text-[var(--color-heading)] dark:text-[var(--color-headingd)]">
          {recipe?.name || recipe?.title || "Untitled recipe"}
        </h1>
        {recipe?.description ? (
          <p className="mt-3 text-sm sm:text-base text-[var(--color-text)] dark:text-[var(--color-textd)] opacity-80">
            {recipe.description}
          </p>
        ) : null}
        <div className="mt-4 flex flex-wrap gap-3 text-xs sm:text-sm font-medium">
          {totalMinutes ? (
            <span className="inline-flex items-center gap-2 bg-chip px-3 py-1 rounded-full">
              ⏱ {totalMinutes}
            </span>
          ) : null}
          {breakdown ? (
            <span className="inline-flex items-center gap-2 bg-chip px-3 py-1 rounded-full">
              🍳 {breakdown}
            </span>
          ) : null}
          {recipe?.cuisine ? (
            <span className="inline-flex items-center gap-2 bg-chip px-3 py-1 rounded-full">
              🌍 {recipe.cuisine}
            </span>
          ) : null}
          {difficultyLabel ? (
            <span className="inline-flex items-center gap-2 bg-chip px-3 py-1 rounded-full">
              🎯 {difficultyLabel}
            </span>
          ) : null}
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
              {ingredients.length > 0
                ? ingredients.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)
                : <li>No ingredients provided.</li>}
            </ul>
          </Tabs.Panel>

          <Tabs.Panel value="steps" pt="md">
            <ol className="list-decimal pl-6 space-y-3 text-sm sm:text-base">
              {steps.length > 0
                ? steps.map((step, index) => <li key={index}>{step}</li>)
                : <li>No steps provided.</li>}
            </ol>
          </Tabs.Panel>
        </Tabs>

        <RecipeDetailActions isSaving={isSaving} onSave={onSave} onTryAnother={onTryAnother} />
      </div>
    </div>
  );
}
