"use client";
// Enables client-side behavior — needed because we use React hooks and event handlers here.

import { FiShuffle } from "react-icons/fi"; 
// Import the shuffle icon from React Icons (Feather icon set)

/**
 * ShuffleButton Component
 * ------------------------------------------------------------
 * A reusable button that:
 *  - Displays a shuffle icon + label (default: "Shuffle")
 *  - Calls an `onClick` handler when pressed
 *  - Supports custom text, class names, and extra props
 */
export default function ShuffleButton({
  onClick,                // function passed from parent (optional)
  children = "Shuffle",   // fallback text if no custom label provided
  className = "",         // optional additional CSS classes
  ...props                // spread other props like aria-label or disabled
}) {
  return (
    <button
      type="button"
      // Handle click event
      onClick={(event) => {
        console.log("[ShuffleButton] Clicked"); // Debug log for click tracking
        onClick?.(event); // Safely call the passed-in function if it exists
      }}
      // Tailwind classes for style, layout, and transitions
      className={`inline-flex items-center justify-center gap-2 
        rounded-full border border-default 
        px-3 py-1.5 text-sm sm:text-base font-semibold 
        text-[var(--color-text)] dark:text-[var(--color-textd)] 
        hover:text-[var(--color-heading)] dark:hover:text-[var(--color-headingd)] 
        whitespace-nowrap shrink-0 
        transition ${className}`}

      aria-label="Shuffle ingredient ideas" // Accessibility label
      {...props} // Spread remaining props (ex: disabled, data attributes, etc.)
    >
      {/* Shuffle icon (Feather icon set) */}
      <FiShuffle className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
      
      {/* Button text (children prop allows custom labels like “Try Again”) */}
      {children}
    </button>
  );
}
