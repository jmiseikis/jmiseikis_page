import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

/** Dark theme on/off switch. The choice is remembered by next-themes in localStorage. */
const ThemeToggle = ({ compact = false }: { compact?: boolean }) => {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const dark = mounted && resolvedTheme === "dark";

  return (
    <button
      type="button"
      aria-pressed={dark}
      onClick={() => setTheme(dark ? "light" : "dark")}
      className={cn(
        "inline-flex min-h-11 items-center gap-2 px-2 text-[12px] font-medium text-muted-foreground hover:text-foreground",
        compact && "min-w-11 justify-center px-1.5",
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "inline-block h-3.5 w-3.5 border border-current",
          dark ? "bg-foreground" : "bg-transparent",
        )}
      />
      {/* A toggle keeps one label; aria-pressed and the filled square show the state. */}
      <span>{compact ? "Dark" : "Dark theme"}</span>
    </button>
  );
};

export default ThemeToggle;
