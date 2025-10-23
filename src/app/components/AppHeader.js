"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Drawer, Stack } from "@mantine/core";
import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";
import { useUser } from "./UserContext";
import { buildSidebarLinks } from "./MainSidebar";
import { TbChefHat } from "react-icons/tb";

const navigationLinks = [
  { href: "/login", label: "Log in" },
  { href: "/signup", label: "Sign up" },
];

export default function AppHeader() {
  const pathname = usePathname() || "/";
  const { user, setRedirectPath } = useUser();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const sidebarLinks = useMemo(() => buildSidebarLinks(Boolean(user)), [user]);

  /**
   * handleAuthLinkClick()
   * -----------------------------------------
   * Stores the intended redirect path so that after login/signup
   * the user returns to the page they expected.
   */
  const handleAuthLinkClick = (href) => {
    if (href === "/login") {
      setRedirectPath(pathname === "/login" ? "/" : pathname);
    }
    if (href === "/signup") {
      setRedirectPath("/login");
    }
  };

  /**
   * useEffect
   * -----------------------------------------
   * Watches for viewport changes and automatically closes
   * the drawer when the view is large enough to show the sidebar.
   */
  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)");

    const handleSizeChange = (event) => {
      setIsLargeScreen(event.matches);
      if (event.matches) {
        setIsDrawerOpen(false);
      }
    };

    setIsLargeScreen(mediaQuery.matches);
    if (mediaQuery.matches) {
      setIsDrawerOpen(false);
    }

    mediaQuery.addEventListener("change", handleSizeChange);
    return () => mediaQuery.removeEventListener("change", handleSizeChange);
  }, []);

  /**
   * useEffect
   * -----------------------------------------
   * Syncs the burger icon color with the current theme.
   */
  useEffect(() => {
    const checkTheme = () => {
      const darkActive = document.documentElement.classList.contains("dark");
      setIsDarkMode(darkActive);
    };

    checkTheme();

    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  const burgerColor = isDarkMode
    ? "var(--color-headingd)"
    : "var(--color-heading)";

  const handleDrawerLinkClick = (href) => {
    if (href === "/login" || href === "/signup") {
      handleAuthLinkClick(href);
    }
    setIsDrawerOpen(false);
  };

  return (
    <header className="w-full sticky top-0 z-20 bg-white dark:bg-[var(--color-surfaced)] border-b border-default transition-colors shadow-sm">
      <nav className="w-full px-6 sm:px-10 lg:px-16 py-3 sm:py-5 flex flex-wrap items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-3" aria-label="MotiChef home">
          <span className="inline-flex h-10 w-5 items-center text-heading justify-center"><TbChefHat size={20}/></span>
          <span className="font-semibold text-lg text-heading">MotiChef</span>
        </Link>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {isLargeScreen &&
            navigationLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => handleAuthLinkClick(href)}
                className="rounded-xl px-3 py-2 text-sm border border-default bg-surface hover:opacity-90 transition text-[var(--color-text)] dark:text-[var(--color-textd)]"
              >
                {label}
              </Link>
            ))}
          {!isLargeScreen && (
            <button
              type="button"
              onClick={() => setIsDrawerOpen((open) => !open)}
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-default bg-surface hover:opacity-90 transition lg:hidden"
              aria-label={isDrawerOpen ? "Close navigation menu" : "Open navigation menu"}
            >
              <span
                className="absolute h-0.5 w-6 rounded-full transition-transform duration-200"
                style={{
                  backgroundColor: burgerColor,
                  top: isDrawerOpen ? "50%" : "30%",
                  left: "50%",
                  transform: isDrawerOpen
                    ? "translate(-50%, -50%) rotate(45deg)"
                    : "translate(-50%, -50%)",
                }}
              />
              <span
                className="absolute h-0.5 w-6 rounded-full transition-opacity duration-150"
                style={{
                  backgroundColor: burgerColor,
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  opacity: isDrawerOpen ? 0 : 1,
                }}
              />
              <span
                className="absolute h-0.5 w-6 rounded-full transition-transform duration-200"
                style={{
                  backgroundColor: burgerColor,
                  top: isDrawerOpen ? "50%" : "70%",
                  left: "50%",
                  transform: isDrawerOpen
                    ? "translate(-50%, -50%) rotate(-45deg)"
                    : "translate(-50%, -50%)",
                }}
              />
            </button>
          )}
        </div>
      </nav>

      <Drawer
        opened={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        position="right"
        title="Navigation"
        padding="lg"
        size="md"
        withinPortal={false}
        overlayProps={{ opacity: 0.55, blur: 2 }}
      >
        <Stack gap="sm">
          {sidebarLinks.map(({ href, label, icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => handleDrawerLinkClick(href)}
              className="rounded-xl border border-default px-4 py-3 bg-surface hover:opacity-90 transition text-[var(--color-text)] dark:text-[var(--color-textd)] inline-flex items-center gap-2"
            >
              <span className="text-lg">{icon}</span>
              <span>{label}</span>
            </Link>
          ))}
        </Stack>
      </Drawer>
    </header>
  );
}
