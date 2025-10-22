"use client";

import { useState } from "react";
import Link from "next/link";
import { Burger, Drawer } from "@mantine/core";
import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";
import { useUser } from "./UserContext";


const navigationLinks = [
  { href: "/login", label: "Log in" },
  { href: "/signup", label: "Sign up" },
];

export default function AppHeader() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const pathname = usePathname() || "/";
  const { setRedirectPath } = useUser();

  const closeDrawer = () => {
    setIsDrawerOpen(false);
  };

  const handleAuthLinkClick = (href) => {
    if (href === "/login") {
      setRedirectPath(pathname === "/login" ? "/" : pathname);
    }
    if (href === "/signup") {
      setRedirectPath("/login");
    }
  };

  return (
    <header className="w-full sticky top-0 z-20 bg-white dark:bg-[var(--color-surfaced)] border-b border-default transition-colors shadow-sm flex">



     <nav className="w-full px-6 sm:px-10 lg:px-16 py-3 sm:py-5 flex flex-wrap items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-3" aria-label="FridgeChef home">
          <span className="inline-flex h-10 w-10 rounded-2xl bg-gradient-main shadow-sm items-center justify-center" />
          <span className="font-semibold text-lg text-heading">FridgeChef</span>
        </Link>

        <div className="hidden sm:flex items-center gap-2">
          <ThemeToggle />
          {navigationLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="rounded-xl px-3 py-2 text-sm border border-default bg-surface hover:opacity-90 transition"
              onClick={() => handleAuthLinkClick(href)}
            >
              {label}
            </Link>
          ))}
        </div>

        <div className="flex flex-1 items-center justify-end sm:hidden">
          <ThemeToggle />
          <Burger
            opened={isDrawerOpen}
            onClick={() => setIsDrawerOpen(!isDrawerOpen)}
            size="sm"
            aria-label="Toggle navigation menu"
            className="ml-3"
          />
        </div>
      </nav>

      <Drawer
        opened={isDrawerOpen}
        onClose={closeDrawer}
        padding="md"
        position="right"
        size="80%"
        overlayProps={{ opacity: 0.35, blur: 4 }}
        classNames={{
          content: "bg-app text-[var(--color-text)] dark:text-[var(--color-textd)]",
          header: "border-b border-default",
          body: "pt-4",
        }}
        title="Menu"
      >
        <div className="flex flex-col gap-4">
          {navigationLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => {
                handleAuthLinkClick(href);
                closeDrawer();
              }}
              className="rounded-xl px-4 py-3 text-base border border-default bg-surface hover:opacity-90 transition text-center"
            >
              {label}
            </Link>
          ))}
        </div>
      </Drawer>
    </header>
  );
}
