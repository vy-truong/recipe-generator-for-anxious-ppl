"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Stack, Burger } from "@mantine/core";
import { BiSolidFoodMenu } from "react-icons/bi";
import { CgProfile } from "react-icons/cg";
import { IoMdHome } from "react-icons/io";
import { TiUserAdd } from "react-icons/ti";
import { MdOutlineWavingHand } from "react-icons/md";

// ────────────────────────────────────────────────
// Menu links array with icon + label
// ────────────────────────────────────────────────
export const sidebarLinks = [
  { href: "/", label: "Home", icon: <IoMdHome /> },
  { href: "/menu", label: "My Menu", icon: <BiSolidFoodMenu /> },
  { href: "/profile", label: "My Profile", icon: <CgProfile /> },
  { href: "/signup", label: "Sign Up", icon: <TiUserAdd /> },
  { href: "/login", label: "Log In", icon: <MdOutlineWavingHand /> },
];

export default function MainSidebar({ className = "" }) {
  const [open, setOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(false);

  // ──────────────────────────────────────────────
  // Detect current theme from <html class="dark">
  // and update whenever it changes
  // ──────────────────────────────────────────────
  useEffect(() => {
    const checkTheme = () => {
      const darkActive = document.documentElement.classList.contains("dark");
      setIsDarkMode(darkActive);
    };

    // Initial check
    checkTheme();

    // Observe <html> for class changes (when theme toggles)
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  // ──────────────────────────────────────────────
  // Track viewport width to keep the sidebar open
  // only on large screens, and close it elsewhere
  // ──────────────────────────────────────────────
  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)");

    const handleMediaChange = (event) => {
      setIsLargeScreen(event.matches);
      setOpen(event.matches);
    };

    setIsLargeScreen(mediaQuery.matches);
    setOpen(mediaQuery.matches);

    mediaQuery.addEventListener("change", handleMediaChange);
    return () => mediaQuery.removeEventListener("change", handleMediaChange);
  }, []);

  // ──────────────────────────────────────────────
  // Choose burger color based on current theme
  // ──────────────────────────────────────────────
  const burgerColor = isDarkMode
    ? "var(--color-headingd)" // light burger in dark mode
    : "var(--color-heading)"; // dark burger in light mode

  return (
    <div className={`relative flex ${className}`}>
      {/* ──────────────────────────────
          SIDEBAR PANEL
      ────────────────────────────── */}
      <aside
        className={`
          flex flex-col shrink-0
          border-r border-default
          bg-surface/80 dark:bg-[var(--color-surfaced)]
          transition-all duration-300 ease-in-out
          ${open ? "w-72 p-6" : "w-0 p-0 overflow-hidden"}
        `}
      >
        {open && (
          <>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h1 className="font-medium text-lg">Navigation</h1>
              <Burger
                color={burgerColor}
                opened
                onClick={() => setOpen(false)}
                aria-label="Close navigation"
              />
            </div>

            {/* Menu Links */}
            <Stack gap="sm">
              {sidebarLinks.map(({ href, label, icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="rounded-xl border border-default px-4 py-3 
                             bg-surface hover:opacity-90 transition inline-flex 
                             items-center gap-2"
                >
                  <span className="text-lg">{icon}</span>
                  <span>{label}</span>
                </Link>
              ))}
            </Stack>
          </>
        )}
      </aside>

      {/* ──────────────────────────────
          FLOATING BURGER (visible when closed)
      ────────────────────────────── */}
      {!open && (
        <div
          role="button"
          tabIndex={0}
          onClick={() => setOpen(true)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              setOpen(true);
            }
          }}
          aria-label="Open navigation"
          className="absolute top-4 left-4 z-10 p-2 rounded-md bg-surface/80 dark:bg-[var(--color-surfaced)] hover:opacity-90 transition border border-default cursor-pointer"
        >
          <Burger opened={false} />
        </div>
      )}
    </div>
  );
}
