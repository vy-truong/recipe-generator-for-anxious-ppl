"use client";

import { MantineProvider } from "@mantine/core";
import { ToastProvider } from "./components/ToastContext";
import { UserProvider } from "./components/UserContext";

export default function AppProviders({ children }) {
  return (
    <MantineProvider>
      <ToastProvider>
        <UserProvider>{children}</UserProvider>
      </ToastProvider>
    </MantineProvider>
  );
}
