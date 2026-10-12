import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

/** Dark theme on/off switch. next-themes remembers the choice in localStorage. */
const ThemeToggle = ({ compact = false }: { compact?: boolean }) => {
  const { resolvedTheme, setTheme, forcedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Pages that are not yet built for the dark theme force light; a switch there would do nothing.
  if (forcedTheme) return null;

  const dark = mounted && resolvedTheme === "dark";

  return (
    <button
      type="button"
      aria-pressed={dark}
      onClick={() => setTheme(dark ? "light" : "dark")}
      className={cn(
        "inline-flex min-h-11 items-center gap-2 px-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground",
        compact && "min-w-11 justify-center px-1.5",
      )}
    >
      <span
        aria-hidden="true"
        className={cn("inline-block h-3.5 w-3.5 border border-current", dark ? "bg-foreground" : "bg-transparent")}
      />
      {/* One fixed label: aria-pressed and the filled square show the state. */}
      <span>{compact ? "Dark" : "Dark theme"}</span>
    </button>
  );
};

export default ThemeToggle;
