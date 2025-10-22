"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Drawer, Stack, Burger } from "@mantine/core";
import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";
import { useUser } from "./UserContext";
import { sidebarLinks } from "./MainSidebar";

const navigationLinks = [
  { href: "/login", label: "Log in" },
  { href: "/signup", label: "Sign up" },
];

export default function AppHeader() {
  const pathname = usePathname() || "/";
  const { setRedirectPath } = useUser();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

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
        <Link href="/" className="flex items-center gap-3" aria-label="FridgeChef home">
          <span className="inline-flex h-10 w-10 rounded-2xl bg-gradient-main shadow-sm items-center justify-center" />
          <span className="font-semibold text-lg text-heading">FridgeChef</span>
        </Link>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {navigationLinks.map(({ href, label }) => (
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
            <Burger
              opened={isDrawerOpen}
              onClick={() => setIsDrawerOpen((open) => !open)}
              color={burgerColor}
              size="sm"
              className="rounded-xl border border-default bg-surface p-2 hover:opacity-90 transition lg:hidden"
              aria-label={isDrawerOpen ? "Close navigation menu" : "Open navigation menu"}
            />
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
