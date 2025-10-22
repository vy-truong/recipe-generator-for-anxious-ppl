"use client";

import { useState } from "react";
import Link from "next/link";
import { Stack, Title, Burger } from "@mantine/core";
import { BiSolidFoodMenu } from "react-icons/bi";
import { CgProfile } from "react-icons/cg";
import { IoIosSettings } from "react-icons/io";

const menuLinks = [
  { href: "/menu", label: "My Menu", icon: <BiSolidFoodMenu /> },
  { href: "/profile", label: "My Profile", icon: <CgProfile /> },
  { href: "/settings", label: "Settings", icon: <IoIosSettings /> },
];

export default function MainSidebar({ className = "" }) {
  const [open, setOpen] = useState(true);

  if (!open) {
    return (
      <div className={`w-72 shrink-0 p-4 border-r border-default ${className}`}>
        <Burger opened={false} onClick={() => setOpen(true)} aria-label="Open navigation" />
      </div>
    );
  }

  return (
    <aside className={`w-72 shrink-0 flex-col border-r border-default 
    bg-surface/80 dark:bg-[var(--color-surfaced)] p-6 gap-6 ${className}`}> 
    
      <div className="flex items-center justify-between">
        <h1 className="font-medium text-lg">Navigation</h1>
        <Burger opened onClick={() => setOpen(false)} aria-label="Close navigation" />
      </div>
      <Stack gap="sm">
        {menuLinks.map(({ href, label, icon }) => (
          <Link
            key={href}
            href={href}
            className="rounded-xl border border-default px-4 py-3 bg-surface hover:opacity-90 transition inline-flex items-center gap-2"
          >
            <span className="text-lg">{icon}</span>
            <span>{label}</span>
          </Link>
        ))}
      </Stack>
    </aside>
  );
}
