import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const schema = z.object({ email: z.string().trim().email().max(320) });

export const SubscribeForm = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ email });
    if (!parsed.success) {
      toast.error("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("digest_subscribers").insert({ email: parsed.data.email });
    setLoading(false);
    if (error && !/duplicate|unique/i.test(error.message)) {
      toast.error("Could not subscribe. Try again in a moment.");
      return;
    }
    setEmail("");
    toast.success("Subscribed. The Friday digest will arrive in your inbox.");
  };

  return (
    <form onSubmit={submit} className="flex items-stretch gap-0 max-w-md">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        aria-label="Email address for the weekly digest"
        className="flex-1 border border-[#CFD2D6] border-r-0 px-3 py-2 font-barlow text-sm bg-white outline-none focus:border-[#0E0E10]"
        style={{ borderRadius: 0 }}
      />
      <button
        type="submit"
        disabled={loading}
        className="bg-[#EC1313] text-white font-barlow-condensed uppercase tracking-widest text-xs px-4 hover:bg-[#0E0E10] transition-colors disabled:opacity-60"
        style={{ borderRadius: 0 }}
      >
        {loading ? "…" : "Subscribe"}
      </button>
    </form>
  );
};