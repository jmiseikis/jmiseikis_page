import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";
import { toast } from "sonner";

type Row = {
  id: string;
  signal_type: string;
  headline: string;
  summary: string | null;
  confidence: number | null;
  canton: string | null;
  amount: number | null;
  currency: string | null;
};

const SwissTechPulseReview = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [editing, setEditing] = useState<Record<string, string>>({});

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) {
      setIsAdmin(null);
      return;
    }
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .eq("role", "admin")
      .maybeSingle()
      .then(({ data }) => setIsAdmin(!!data));
  }, [session]);

  const load = async () => {
    const { data, error } = await supabase
      .from("items")
      .select("id, signal_type, headline, summary, confidence, canton, amount, currency")
      .eq("status", "needs_review")
      .order("confidence", { ascending: true })
      .limit(100);
    if (error) toast.error(error.message);
    setRows((data as Row[]) || []);
  };

  useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin]);

  const callAction = async (action: "approve" | "hide" | "edit_summary", id: string, summary?: string) => {
    setBusy(id);
    const { error } = await supabase.functions.invoke("admin-actions", {
      body: { action, item_id: id, summary },
    });
    setBusy(null);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Done");
    setRows((r) => r.filter((x) => x.id !== id || action === "edit_summary"));
  };

  const signIn = async () => {
    const email = prompt("Email:");
    const password = prompt("Password:");
    if (!email || !password) return;
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) toast.error(error.message);
  };

  return (
    <div className="min-h-screen bg-white text-[#0E0E10]">
      <Helmet>
        <title>Swiss Tech Pulse — Review</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <Navigation />
      <main className="container mx-auto px-4 pt-28 pb-16 max-w-5xl">
        <h1 className="font-anton uppercase text-4xl">Review queue</h1>
        {!session && (
          <div className="mt-6">
            <button onClick={signIn} className="border border-[#0E0E10] px-4 py-2 font-barlow-condensed uppercase tracking-widest text-xs hover:bg-[#0E0E10] hover:text-white">
              Sign in
            </button>
          </div>
        )}
        {session && isAdmin === false && (
          <p className="mt-6 font-barlow text-[#0E0E10]/70">Signed in but not an admin.</p>
        )}
        {isAdmin && (
          <ul className="mt-6 divide-y divide-[#CFD2D6]">
            {rows.map((r) => (
              <li key={r.id} className="py-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-barlow-condensed uppercase tracking-widest text-[11px] border border-[#CFD2D6] px-2 py-0.5">{r.signal_type}</span>
                  {r.canton && <span className="font-barlow-condensed uppercase tracking-widest text-[11px] border border-[#CFD2D6] px-2 py-0.5">{r.canton}</span>}
                  {typeof r.confidence === "number" && (
                    <span className="font-barlow-condensed uppercase tracking-widest text-[11px] text-[#0E0E10]/60">
                      conf {r.confidence.toFixed(2)}
                    </span>
                  )}
                </div>
                <div className="font-barlow font-bold mt-1">{r.headline}</div>
                <textarea
                  defaultValue={r.summary ?? ""}
                  onChange={(e) => setEditing((s) => ({ ...s, [r.id]: e.target.value }))}
                  className="mt-2 w-full border border-[#CFD2D6] p-2 font-barlow text-sm"
                  rows={3}
                />
                <div className="mt-2 flex gap-2">
                  <button
                    disabled={busy === r.id}
                    onClick={() => callAction("approve", r.id)}
                    className="bg-[#EC1313] text-white font-barlow-condensed uppercase tracking-widest text-xs px-3 py-1.5"
                  >
                    Approve
                  </button>
                  <button
                    disabled={busy === r.id}
                    onClick={() => callAction("edit_summary", r.id, editing[r.id] ?? r.summary ?? "")}
                    className="border border-[#0E0E10] font-barlow-condensed uppercase tracking-widest text-xs px-3 py-1.5"
                  >
                    Save summary
                  </button>
                  <button
                    disabled={busy === r.id}
                    onClick={() => callAction("hide", r.id)}
                    className="border border-[#CFD2D6] font-barlow-condensed uppercase tracking-widest text-xs px-3 py-1.5"
                  >
                    Hide
                  </button>
                </div>
              </li>
            ))}
            {rows.length === 0 && <li className="py-6 font-barlow text-[#0E0E10]/60">Queue empty.</li>}
          </ul>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default SwissTechPulseReview;