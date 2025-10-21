"use client";

import { useEffect, useMemo, useState } from "react";
import { FiShuffle } from "react-icons/fi";

const DEFAULT_VISIBLE_COUNT = 5;

function pickRandomCombos(combos, count) {
  if (!Array.isArray(combos) || combos.length === 0) return [];

  const copy = [...combos];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, Math.min(count, copy.length));
}

export default function IngredientCombos({ combos, onSelect }) {
  const [visibleCombos, setVisibleCombos] = useState(() =>
    pickRandomCombos(combos, DEFAULT_VISIBLE_COUNT)
  );

  useEffect(() => {
    setVisibleCombos(pickRandomCombos(combos, DEFAULT_VISIBLE_COUNT));
  }, [combos]);

  const hasCombos = useMemo(() => Array.isArray(visibleCombos) && visibleCombos.length > 0, [visibleCombos]);

  if (!hasCombos) {
    return null;
  }

  const regenerateCombos = () => {
    setVisibleCombos(pickRandomCombos(combos, DEFAULT_VISIBLE_COUNT));
  };

  return (
    <div className="text-left w-full max-w-3xl mx-auto">
      <div className="flex items-center justify-between gap-3">
        <p className="text-base uppercase tracking-wide text-black/50 dark:text-white/50">Need inspo?</p>
        <button
          type="button"
          onClick={regenerateCombos}
          className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] px-3 py-1.5 text-base font-semibold text-black/60 hover:text-[var(--color-heading-hl)] dark:text-white/60 transition"
          aria-label="Shuffle ingredient ideas"
        >
          <FiShuffle className="h-5 w-5" />
          Shuffle
        </button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {visibleCombos.map((combo) => (
          <button
            key={combo}
            type="button"
            onClick={() => onSelect?.(combo)}
            className="px-4 py-2 rounded-2xl border border-[var(--color-border)] bg-surface text-base hover:opacity-90 transition shadow-sm"
          >
            {combo}
          </button>
        ))}
      </div>
    </div>
  );
}
