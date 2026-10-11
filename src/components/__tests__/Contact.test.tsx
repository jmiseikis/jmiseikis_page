import { useEffect } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Contact from "@/components/Contact";

// Stand-in for the Cloudflare widget: reports the error a site gets when its hostname is
// missing from the widget's hostname list (110200).
vi.mock("@marsidev/react-turnstile", () => ({
  Turnstile: ({ onError }: { onError?: (code: string) => void }) => {
    useEffect(() => {
      onError?.("110200");
    }, [onError]);
    return <div data-testid="turnstile" />;
  },
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { functions: { invoke: vi.fn() } },
}));

describe("Contact form", () => {
  it("explains a failed spam check and points to LinkedIn", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    render(<Contact />);
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("The spam check could not load");
    expect(alert.querySelector("a")).toHaveAttribute("href", "https://www.linkedin.com/in/justinasmiseikis/");
    expect(console.error).toHaveBeenCalledWith("Turnstile error:", "110200");
  });
});
