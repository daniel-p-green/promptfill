import { renderTemplate } from "@/lib/templateRender";

const accent = "#10a37f";

const promptTemplate = `Write an email to {{recipient_name}} about {{topic}}.

Tone: {{tone}}

Context:
{{context}}

Close with a clear ask and include a short subject line.`;

const promptValues = {
  recipient_name: "Alex Chen",
  topic: "Q2 pricing update",
  tone: "concise",
  context:
    "We are rolling out updated pricing on April 15. Existing customers keep current pricing for 12 months. New customers get the new tiers.",
};

const preview = renderTemplate(promptTemplate, promptValues);

const libraryItems = [
  {
    name: "Write a client email",
    description: "Reusable outbound email with tone + CTA options.",
    tags: ["email", "sales"],
    selected: true,
  },
  {
    name: "Summarize for executives",
    description: "Turn notes into crisp exec brief.",
    tags: ["summary", "exec"],
  },
  {
    name: "Rewrite in friendly tone",
    description: "Make any copy warmer without losing structure.",
    tags: ["rewrite", "tone"],
  },
  {
    name: "Extract action items",
    description: "Convert notes to tasks with owners.",
    tags: ["meeting", "tasks"],
  },
];

const variables = [
  { name: "recipient_name", type: "string", required: true, defaultValue: "Alex Chen" },
  { name: "topic", type: "string", required: true, defaultValue: "Q2 pricing update" },
  { name: "tone", type: "enum", required: true, defaultValue: "concise" },
  { name: "context", type: "text", required: false, defaultValue: "" },
  { name: "cta", type: "string", required: false, defaultValue: "Book a 15-min call" },
];

const optionSets = [
  { name: "Tone", options: ["concise", "friendly", "direct", "formal"] },
  { name: "Audience", options: ["execs", "engineering", "sales", "customers"] },
  { name: "Format", options: ["bullets", "paragraphs", "email", "slack_update"] },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f6f6f3] text-zinc-900">
      <header className="border-b border-black/5 bg-white/70 backdrop-blur">
        <div className="mx-auto flex w-full max-w-[1280px] items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div
              className="h-9 w-9 rounded-full"
              style={{
                background: accent,
                boxShadow: "0 8px 24px rgba(16,163,127,0.25)",
              }}
            />
            <div>
              <div className="text-sm uppercase tracking-[0.28em] text-zinc-500">
                PromptFill
              </div>
              <div className="text-lg font-semibold tracking-tight">
                Prompts that feel like a product
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium text-zinc-700">
              Export
            </button>
            <button
              className="rounded-full px-4 py-2 text-sm font-semibold text-white"
              style={{ background: accent }}
            >
              New prompt
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1280px] px-6 py-6">
        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)_360px]">
          <section className="rounded-3xl border border-black/10 bg-white p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-zinc-800">Library</div>
              <button className="text-xs font-medium text-zinc-500">View all</button>
            </div>
            <div className="mt-3">
              <input
                type="text"
                placeholder="Search prompts"
                className="w-full rounded-2xl border border-black/10 bg-[#fafafa] px-3 py-2 text-sm focus:outline-none"
              />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {["email", "summary", "rewrite", "tasks", "product"].map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs text-zinc-600"
                >
                  {tag}
                </span>
              ))}
            </div>
            <div className="mt-4 space-y-3">
              {libraryItems.map((item) => (
                <div
                  key={item.name}
                  className={`rounded-2xl border px-3 py-3 transition ${
                    item.selected
                      ? "border-emerald-200 bg-emerald-50/60"
                      : "border-black/10 bg-white"
                  }`}
                >
                  <div className="text-sm font-semibold text-zinc-900">{item.name}</div>
                  <div className="mt-1 text-xs text-zinc-500">{item.description}</div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-white px-2 py-[2px] text-[10px] text-zinc-500"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-black/10 bg-white p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-2xl font-semibold tracking-tight">
                  Write a client email
                </div>
                <div className="mt-1 text-sm text-zinc-500">
                  Reusable outbound email with structured variables and tone presets.
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  {["email", "sales", "outbound"].map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-black/10 bg-white px-3 py-1 text-zinc-500"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <button className="rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-semibold">
                Duplicate
              </button>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_220px]">
              <div>
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-zinc-800">Template</div>
                  <button
                    className="rounded-full px-3 py-1 text-xs font-semibold text-white"
                    style={{ background: accent }}
                  >
                    Extract variables
                  </button>
                </div>
                <textarea
                  className="mt-2 h-[260px] w-full rounded-2xl border border-black/10 bg-[#fafafa] p-4 font-mono text-[13px] leading-6 text-zinc-800 focus:outline-none"
                  defaultValue={promptTemplate}
                />
                <div className="mt-2 rounded-2xl border border-emerald-200 bg-emerald-50/60 px-3 py-2 text-xs text-emerald-900">
                  AI proposal: found 5 variables and 2 dropdowns. Review before applying.
                </div>
              </div>

              <div className="rounded-2xl border border-black/10 bg-white p-3">
                <div className="text-xs font-semibold text-zinc-700">Option sets</div>
                <div className="mt-2 space-y-3">
                  {optionSets.map((set) => (
                    <div key={set.name} className="rounded-xl border border-black/10 px-3 py-2">
                      <div className="text-xs font-semibold text-zinc-800">{set.name}</div>
                      <div className="mt-1 text-[11px] text-zinc-500">
                        {set.options.join("  /  ")}
                      </div>
                    </div>
                  ))}
                </div>
                <button className="mt-3 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-xs font-semibold text-zinc-600">
                  New option set
                </button>
              </div>
            </div>

            <div className="mt-6">
              <div className="text-sm font-semibold text-zinc-800">Variables</div>
              <div className="mt-3 overflow-hidden rounded-2xl border border-black/10">
                <div className="grid grid-cols-[1fr_100px_90px_1fr] gap-2 border-b border-black/10 bg-[#fafafa] px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
                  <div>Name</div>
                  <div>Type</div>
                  <div>Required</div>
                  <div>Default</div>
                </div>
                {variables.map((variable) => (
                  <div
                    key={variable.name}
                    className="grid grid-cols-[1fr_100px_90px_1fr] gap-2 px-4 py-3 text-sm text-zinc-700"
                  >
                    <div className="font-mono text-[12px] text-zinc-800">
                      {variable.name}
                    </div>
                    <div className="text-xs uppercase tracking-wide text-zinc-500">
                      {variable.type}
                    </div>
                    <div className="text-xs">{variable.required ? "Yes" : "No"}</div>
                    <div className="text-xs text-zinc-500">{variable.defaultValue}</div>
                  </div>
                ))}
              </div>
              <button className="mt-3 rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-semibold text-zinc-600">
                Add variable
              </button>
            </div>
          </section>

          <section className="rounded-3xl border border-black/10 bg-white p-5">
            <div className="text-sm font-semibold text-zinc-800">Fill + Preview</div>
            <div className="mt-4 space-y-3">
              <label className="block text-xs text-zinc-500">
                Recipient name
                <input
                  type="text"
                  defaultValue={promptValues.recipient_name}
                  className="mt-1 w-full rounded-xl border border-black/10 bg-[#fafafa] px-3 py-2 text-sm text-zinc-800 focus:outline-none"
                />
              </label>
              <label className="block text-xs text-zinc-500">
                Topic
                <input
                  type="text"
                  defaultValue={promptValues.topic}
                  className="mt-1 w-full rounded-xl border border-black/10 bg-[#fafafa] px-3 py-2 text-sm text-zinc-800 focus:outline-none"
                />
              </label>
              <label className="block text-xs text-zinc-500">
                Tone
                <select className="mt-1 w-full rounded-xl border border-black/10 bg-[#fafafa] px-3 py-2 text-sm text-zinc-800 focus:outline-none">
                  {optionSets[0].options.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              </label>
              <label className="block text-xs text-zinc-500">
                Context
                <textarea
                  defaultValue={promptValues.context}
                  className="mt-1 h-24 w-full rounded-xl border border-black/10 bg-[#fafafa] px-3 py-2 text-sm text-zinc-800 focus:outline-none"
                />
              </label>
            </div>
            <div className="mt-4 rounded-2xl border border-black/10 bg-[#fafafa] p-3">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
                Preview
              </div>
              <pre className="mt-2 whitespace-pre-wrap text-xs leading-5 text-zinc-800">
                {preview}
              </pre>
            </div>
            <button
              className="mt-4 w-full rounded-full px-4 py-2 text-sm font-semibold text-white"
              style={{ background: accent }}
            >
              Copy prompt
            </button>
          </section>
        </div>
      </main>
    </div>
  );
}
