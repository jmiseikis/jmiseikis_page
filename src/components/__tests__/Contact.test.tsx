import { useEffect } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Link, MemoryRouter } from "react-router-dom";
import Contact from "@/components/Contact";
import { composeMessage } from "@/lib/contact";
import { supabase } from "@/integrations/supabase/client";

// Stand-in for the Cloudflare widget. "error" reports the code a site gets when its hostname is missing from
// the widget's hostname list (110200); "success" passes the check straight away.
let turnstileMode: "error" | "success" = "success";
vi.mock("@marsidev/react-turnstile", () => ({
  Turnstile: ({ onError, onSuccess }: { onError?: (code: string) => void; onSuccess?: (token: string) => void }) => {
    // Like the real widget, report once when it mounts, not on every re-render.
    useEffect(() => {
      if (turnstileMode === "error") onError?.("110200");
      else onSuccess?.("test-token");
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return <div data-testid="turnstile" />;
  },
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { functions: { invoke: vi.fn() } },
}));

const invoke = supabase.functions.invoke as unknown as ReturnType<typeof vi.fn>;

const renderAt = (path = "/") =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Link to="/?enquiry=diligence#contact">Assessment link</Link>
      <Contact />
    </MemoryRouter>,
  );

const fill = (label: RegExp, value: string) => fireEvent.change(screen.getByLabelText(label), { target: { value } });

beforeEach(() => {
  turnstileMode = "success";
  invoke.mockReset();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("Contact form", () => {
  it("explains a failed spam check and points to LinkedIn", async () => {
    turnstileMode = "error";
    renderAt();
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("The spam check could not load");
    expect(alert.querySelector("a")).toHaveAttribute("href", "https://www.linkedin.com/in/justinasmiseikis/");
    expect(console.error).toHaveBeenCalledWith("Turnstile error:", "110200");
  });

  it("preselects the purpose from the link, ignores unknown values and keeps what was typed", () => {
    renderAt("/?enquiry=speaking#contact");
    const select = screen.getByLabelText("Enquiry type") as HTMLSelectElement;
    expect(select.value).toBe("speaking");

    fill(/^Message/, "We are planning a summit in March.");
    fireEvent.click(screen.getByRole("link", { name: "Assessment link" }));
    expect(select.value).toBe("diligence");
    expect((screen.getByLabelText(/^Message/) as HTMLTextAreaElement).value).toBe("We are planning a summit in March.");
  });

  it("falls back to advisory for an unknown purpose", () => {
    renderAt("/?enquiry=free-money#contact");
    expect((screen.getByLabelText("Enquiry type") as HTMLSelectElement).value).toBe("advisory");
  });

  it("shows field errors next to the fields and sends nothing", () => {
    renderAt();
    fireEvent.click(screen.getByRole("button", { name: /Send enquiry/ }));
    expect(screen.getByText("Please enter your name.")).toBeInTheDocument();
    expect(screen.getByText("Please enter a valid email address.")).toBeInTheDocument();
    expect(screen.getByText("Please write at least 10 characters.")).toBeInTheDocument();
    expect(screen.getByLabelText(/^Name/)).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText(/^Name/)).toHaveFocus();
    expect(invoke).not.toHaveBeenCalled();
  });

  it("sends the purpose inside the message and confirms only after the server accepts it", async () => {
    let resolve: (value: { error: null }) => void = () => {};
    invoke.mockReturnValue(new Promise((r) => (resolve = r)));
    renderAt("/?enquiry=scouting#contact");
    fill(/^Name/, "Ada Lovelace");
    fill(/^Email/, "ada@example.org");
    fill(/^Message/, "We would like a Swiss scouting brief for warehouse robotics.");
    fireEvent.click(screen.getByRole("button", { name: /Send enquiry/ }));

    expect(invoke).toHaveBeenCalledWith("send-contact-email", {
      body: {
        name: "Ada Lovelace",
        email: "ada@example.org",
        organization: undefined,
        message: composeMessage("scouting", "We would like a Swiss scouting brief for warehouse robotics."),
        captchaToken: "test-token",
      },
    });
    expect(invoke.mock.calls[0][1].body.message).toMatch(
      /^Enquiry type: Technology scouting, market entry or Swiss partnerships\n\n/,
    );
    expect(screen.getByRole("button", { name: /Sending/ })).toBeDisabled();
    expect(screen.queryByText("Thank you. Your message has been sent.")).not.toBeInTheDocument();

    resolve({ error: null });
    expect(await screen.findByText("Thank you. Your message has been sent.")).toBeInTheDocument();
    expect((screen.getByLabelText(/^Name/) as HTMLInputElement).value).toBe("");
  });

  it("keeps the message and offers LinkedIn when sending fails", async () => {
    invoke.mockResolvedValue({ error: new Error("boom") });
    renderAt();
    fill(/^Name/, "Ada Lovelace");
    fill(/^Email/, "ada@example.org");
    fill(/^Message/, "A message that will not go through.");
    fireEvent.click(screen.getByRole("button", { name: /Send enquiry/ }));
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Your message could not be sent");
    expect((screen.getByLabelText(/^Message/) as HTMLTextAreaElement).value).toBe("A message that will not go through.");
    await waitFor(() => expect(console.error).toHaveBeenCalledWith("Contact form submission failed", "boom"));
  });

  it("rejects a message that would exceed the server limit once the purpose is added", () => {
    renderAt();
    fill(/^Name/, "Ada Lovelace");
    fill(/^Email/, "ada@example.org");
    fill(/^Message/, "x".repeat(1990));
    fireEvent.click(screen.getByRole("button", { name: /Send enquiry/ }));
    expect(screen.getByText(/Please shorten your message/)).toBeInTheDocument();
    expect(invoke).not.toHaveBeenCalled();
  });
});
