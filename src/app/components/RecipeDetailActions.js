"use client";

import { Button } from "@mantine/core";

export default function RecipeDetailActions({
  isSaving,
  onSave,
  onTryAnother,
}) {
  return (
    <div className="mt-8 flex flex-col sm:flex-row gap-3">
      {onSave ? (
        <Button
          fullWidth
          radius="lg"
          size="md"
          className="bg-[#FDAA6B] hover:bg-[#f68f3c] text-white"
          loading={isSaving}
          onClick={onSave}
        >
          Save to My Menu
        </Button>
      ) : null}
      {onTryAnother ? (
        <Button
          fullWidth
          radius="lg"
          size="md"
          variant="outline"
          onClick={onTryAnother}
        >
          Try Another Dish
        </Button>
      ) : null}
    </div>
  );
}
