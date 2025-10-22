"use client";

import { MantineProvider } from "@mantine/core";

export default function AppProviders({ children }) {
  return <MantineProvider>{children}</MantineProvider>;
}
