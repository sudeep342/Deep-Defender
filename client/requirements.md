## Packages
date-fns | Formatting timestamps in the log table
lucide-react | Icons for dashboard

## Notes
Tailwind Config - extend fontFamily:
fontFamily: {
  sans: ["var(--font-sans)"],
  display: ["var(--font-display)"],
  mono: ["var(--font-mono)"],
}
Tailwind Config - extend colors:
colors: {
  success: "hsl(var(--success))",
  "success-foreground": "hsl(var(--success-foreground))",
}
Poll GET /api/events and /api/analytics every 2s
Use dark mode as the default theme.
