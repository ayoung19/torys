"use client";

import { extendTheme } from "@chakra-ui/react";
import { theme as baseTheme } from "@saas-ui/react";

export const theme = extendTheme(
  {
    fonts: {
      heading: "var(--font-inter)",
      body: "var(--font-inter)",
    },
  },
  baseTheme,
);
