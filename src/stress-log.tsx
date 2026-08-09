import { useState } from "react";

const DISTORTIONS: { name: string; check: string }[] = [
  { name: "Catastrophizing", check: "Am I imagining the worst possible outcome?" },
  { name: "Mind-reading", check: "Am I assuming I know what someone else is thinking?" },
  { name: "All-or-nothing", check: "Am I seeing only two extremes with no middle ground?" },
  { name: "Fortune-telling", check: "Am I predicting a negative future with certainty?" },
  { name: "Emotional reasoning", check: "Am I treating a feeling as evidence of fact?" },
  { name: "Overgeneralization", check: "Am I drawing a sweeping conclusion from one event?" },
  { name: "Personalization", check: "Am I taking excessive responsibility for something outside my control?" },
  { name: "Should statements", check: "Am I using rigid, demanding rules about how I/others must behave?" },
  { name: "Mental filtering", check: "Am I only noticing the negative and ignoring the positive?" },
  { name: "Discounting positives", check: "Am I acknowledging good things but dismissing them as irrelevant?" },
];

const initial = {
  situation: "",
  automaticThought: "",
  emotion: "",
  intensity: "" as string | number,
  evidenceAgainst: "",
  balancedThought: "",
  reRate: "" as string | number,
  distortions: [] as string[],
};

type Entry = typeof initial;

const Hint = ({ children }: { children: React.ReactNode }) => (
  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{children}</p>
);

const StressLog = () => {
  const [form, setForm] = useState<Entry>({ ...initial, distortions: [] });
  const [submitted, setSubmitted] = useState<Entry | null>(null);

  const set = (field: keyof Entry) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const toggleDistortion = (name: string) =>
    setForm((prev) => ({
      ...prev,
      distortions: prev.distortions.includes(name)
        ? prev.distortions.filter((x) => x !== name)
        : [...prev.distortions, name],
    }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const entry = { ...form };
    setSubmitted(entry);
    setTimeout(() => window.print(), 100);
  };

  const handleClear = () => {
    setForm({ ...initial, distortions: [] });
    setSubmitted(null);
  };

  return (
    <>
      <style>{`
        @media print {
          .screen-only { display: none !important; }
          .print-only { display: block !important; }
          body { background: white !important; color: black !important; }
          @page { margin: 2cm; }
        }
        .print-only { display: none; }
      `}</style>

      {/* ── Screen form ── */}
      <main className="screen-only min-h-screen flex items-start justify-center bg-background p-6 pt-12">
        <div className="w-full max-w-xl">

          {/* Info block */}
          <div className="mb-6 rounded-lg border border-blue-500/30 bg-blue-500/10 p-4 text-sm text-foreground space-y-2">
            <p>
              <strong>When to use this:</strong> When you&rsquo;re calm and your prefrontal cortex
              is online. If you&rsquo;re in acute stress or dissociation, use a physiological reset
              first (cold water face, physiological sigh, feet into floor), then come back to this
              afterwards.
            </p>
            <p>
              <strong>Why it works:</strong> Writing slows down the automatic thought sequence and
              makes thoughts visible <em>as thoughts</em>, not facts. The active ingredient is the
              slowing-down — many people improve from the act of catching thoughts in writing alone.
            </p>
          </div>

          <div className="rounded-lg border border-input bg-card p-6 shadow-sm">
            <h1 className="text-xl font-semibold text-foreground">Stress Log</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              CBT Thought Record — 5-column format
            </p>

            {/* Instructions summary */}
            <details className="mt-4 rounded-md border border-input bg-muted/50 p-3 text-sm text-foreground">
              <summary className="cursor-pointer font-medium">Instructions</summary>
              <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-muted-foreground">
                <li><strong className="text-foreground">Situation:</strong> What happened? Where were you? Who with? Stick to observable facts — not interpretations.</li>
                <li><strong className="text-foreground">Automatic Thought:</strong> What went through your mind in that moment? Write it in the <em>exact words</em> your mind used, in first person, present tense. &ldquo;I&rsquo;m going to fail&rdquo; not &ldquo;I felt like I might fail.&rdquo;</li>
                <li><strong className="text-foreground">Emotion + Intensity:</strong> Name the emotion (one word: anxious, angry, ashamed, sad) and rate it 0–10.</li>
                <li><strong className="text-foreground">Evidence Against the Thought:</strong> What do you know that <em>doesn&rsquo;t</em> support this thought? What facts, past experiences, or alternative explanations exist?</li>
                <li><strong className="text-foreground">Balanced Thought:</strong> A more accurate, fair, or compassionate way of looking at it. <em>Not</em> forced positivity — something you genuinely believe after reviewing the evidence.</li>
                <li><strong className="text-foreground">Re-rate Emotion:</strong> After completing, re-rate the original emotion 0–10.</li>
              </ol>
            </details>

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              {/* 1. Situation */}
              <label className="block">
                <span className="text-sm font-medium text-foreground">1. Situation</span>
                <Hint>
                  What happened? Where were you? Who with? Stick to observable facts — not
                  interpretations.
                </Hint>
                <input
                  required
                  type="text"
                  value={form.situation}
                  onChange={set("situation")}
                  className="mt-2 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </label>

              {/* 2. Automatic Thought */}
              <label className="block">
                <span className="text-sm font-medium text-foreground">2. Automatic Thought</span>
                <Hint>
                  What went through your mind in that moment? Write it in the <em>exact words</em>{" "}
                  your mind used, in first person, present tense. &ldquo;I&rsquo;m going to
                  fail&rdquo; not &ldquo;I felt like I might fail.&rdquo;
                </Hint>
                <textarea
                  required
                  rows={3}
                  value={form.automaticThought}
                  onChange={set("automaticThought")}
                  className="mt-2 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-y"
                />
              </label>

              {/* 3. Emotion + Intensity */}
              <fieldset>
                <legend className="text-sm font-medium text-foreground">3. Emotion + Intensity</legend>
                <Hint>
                  Name the emotion (one word: anxious, angry, ashamed, sad) and rate it 0–10.
                </Hint>
                <div className="mt-2 flex gap-3">
                  <input
                    required
                    type="text"
                    placeholder="One word"
                    value={form.emotion}
                    onChange={set("emotion")}
                    className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <input
                    required
                    type="number"
                    min={0}
                    max={10}
                    placeholder="0–10"
                    value={form.intensity}
                    onChange={set("intensity")}
                    className="w-20 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </fieldset>

              {/* 4. Evidence AGAINST */}
              <label className="block">
                <span className="text-sm font-medium text-foreground">4. Evidence AGAINST the thought</span>
                <Hint>
                  What do you know that <em>doesn&rsquo;t</em> support this thought? What facts,
                  past experiences, or alternative explanations exist?
                </Hint>
                <textarea
                  required
                  rows={4}
                  value={form.evidenceAgainst}
                  onChange={set("evidenceAgainst")}
                  className="mt-2 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-y"
                />
              </label>

              {/* 5. Balanced Thought */}
              <label className="block">
                <span className="text-sm font-medium text-foreground">5. Balanced Thought</span>
                <Hint>
                  A more accurate, fair, or compassionate way of looking at it. NOT forced
                  positivity — something you genuinely believe after reviewing the evidence.
                </Hint>
                <textarea
                  required
                  rows={3}
                  value={form.balancedThought}
                  onChange={set("balancedThought")}
                  className="mt-2 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-y"
                />
              </label>

              {/* 6. Re-rate Emotion */}
              <label className="block">
                <span className="text-sm font-medium text-foreground">6. Re-rate Emotion</span>
                <Hint>
                  After completing the balanced thought, re-rate the original emotion 0–10.
                </Hint>
                <input
                  required
                  type="number"
                  min={0}
                  max={10}
                  placeholder="0–10"
                  value={form.reRate}
                  onChange={set("reRate")}
                  className="mt-2 block w-24 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </label>

              {/* 7. Distortion checklist */}
              <fieldset>
                <legend className="text-sm font-medium text-foreground">Cognitive Distortions</legend>
                <Hint>
                  Which distortion does your automatic thought fit? Labeling the pattern weakens it.
                </Hint>
                <div className="mt-2 grid grid-cols-1 gap-y-2">
                  {DISTORTIONS.map((d) => (
                    <label key={d.name} className="flex items-start gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.distortions.includes(d.name)}
                        onChange={() => toggleDistortion(d.name)}
                        className="mt-0.5 size-4 shrink-0 rounded border-input accent-primary"
                      />
                      <span>
                        <span className="font-medium text-foreground">{d.name}</span>
                        <span className="ml-1 text-muted-foreground">— {d.check}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  Print Log
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  className="inline-flex items-center rounded-md border border-input bg-muted px-4 py-2 text-sm font-medium text-foreground hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  Clear
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* ── Print view ── */}
      {submitted && (
        <main className="print-only p-8 font-sans text-black bg-white">
          <h1 className="text-2xl font-bold mb-6">Stress Log</h1>

          <div className="space-y-5 max-w-2xl">
            <Section label="Situation" value={submitted.situation} />
            <Section label="Automatic Thought" value={submitted.automaticThought} />
            <Section label="Emotion + Intensity">
              {submitted.emotion} — {submitted.intensity}/10
            </Section>
            <Section label="Evidence AGAINST the thought" value={submitted.evidenceAgainst} />
            <Section label="Balanced Thought" value={submitted.balancedThought} />
            <Section label="Re-rate Emotion">{submitted.reRate}/10</Section>
            {submitted.distortions.length > 0 && (
              <Section label="Cognitive Distortions">
                {submitted.distortions.join(", ")}
              </Section>
            )}
          </div>

          <p className="mt-8 text-xs text-gray-400">
            Printed {new Date().toLocaleDateString("en-AU", { dateStyle: "full" })}
          </p>
        </main>
      )}
    </>
  );
};

const Section = ({
  label,
  value,
  children,
}: {
  label: string;
  value?: string;
  children?: React.ReactNode;
}) => (
  <div>
    <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">{label}</h2>
    {value ? (
      <p className="mt-1 text-base whitespace-pre-wrap">{value}</p>
    ) : (
      <p className="mt-1 text-base">{children}</p>
    )}
  </div>
);

export default StressLog;
