"use client";

/**
 * Renders the Easy/Medium/Hard toggle group.
 * Keeps the styling logic in one place so the page stays readable.
 */
export default function DifficultySelector({ options, active, onSelect, disabled }) {
  if (!Array.isArray(options) || !options.length) {
    console.warn("[DifficultySelector] Missing options");
    return null;
  }

  return (
    <div className="mt-5 text-left">
      <p className="text-sm font-medium text-[var(--color-text)] dark:text-[var(--color-textd)]">
        How performative you feel today ?
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map(({ value, label }) => {
          const isActive = value === active;
          return (
            <button
              key={value}
              type="button"
              onClick={() => {
                console.log("[DifficultySelector] Option selected", value);
                onSelect?.(value);
              }}
              aria-pressed={isActive}
              disabled={disabled}
              className={`btn-difficulty ${isActive ? "btn-difficulty-active" : "btn-difficulty-inactive"}`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
