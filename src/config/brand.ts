/** Atlas Funded brand tokens — sourced from atlasfunded.com */
export const brand = {
  name: "Atlas Funded",
  productName: "Atlas Command Center",
  tagline: "Navigate to Success",
  website: "https://atlasfunded.com",
  logoUrl:
    "https://cdn.prod.website-files.com/691081218a0bbd4c3bdf5ad0/691081218a0bbd4c3bdf5b03_Logo%20(77).png",
  colors: {
    primary: "#4d65ff",
    accent: "#1a73e8",
    navy: "#1a3a52",
    cream: "#f0ece5",
    dark: "#0a0e17",
    surface: "#111827",
    glass: "rgba(17, 24, 39, 0.72)",
    neon: "#4d65ff",
    neonCyan: "#22d3ee",
    success: "#22c55e",
    warning: "#f59e0b",
    danger: "#ef4444",
    muted: "#94a3b8",
  },
  fonts: {
    sans: "var(--font-geist-sans), system-ui, sans-serif",
    mono: "var(--font-geist-mono), ui-monospace, monospace",
  },
  tone: "Premium prop firm — confident, transparent, growth-focused.",
} as const;

export type BrandColors = typeof brand.colors;
