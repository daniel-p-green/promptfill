const STARTER_TEMPLATES = [
  {
    id: "starter_email_outreach",
    use_case: "email",
    name: "Email outreach",
    template:
      "Write a {{tone}} outreach email to {{recipient_name}} about {{topic}}. Include {{context}} and end with one clear CTA.",
    variables: [
      { name: "tone", type: "enum", required: true, defaultValue: "friendly", options: ["friendly", "direct", "formal"] },
      { name: "recipient_name", type: "string", required: true, defaultValue: "" },
      { name: "topic", type: "string", required: true, defaultValue: "" },
      { name: "context", type: "text", required: true, defaultValue: "" },
    ],
  },
  {
    id: "starter_exec_summary",
    use_case: "summary",
    name: "Executive summary",
    template:
      "Summarize {{source_notes}} for {{audience}} in {{format}} with {{length}} length. Include top risks and recommended next actions.",
    variables: [
      { name: "source_notes", type: "text", required: true, defaultValue: "" },
      { name: "audience", type: "enum", required: true, defaultValue: "execs", options: ["execs", "engineering", "sales", "customers"] },
      { name: "format", type: "enum", required: true, defaultValue: "bullets", options: ["bullets", "paragraphs", "email", "slack_update"] },
      { name: "length", type: "enum", required: true, defaultValue: "short", options: ["short", "medium", "long"] },
    ],
  },
  {
    id: "starter_support_reply",
    use_case: "support",
    name: "Support reply",
    template:
      "Draft a {{tone}} support response to {{customer_name}} about {{issue_summary}}. Include resolution steps and whether to {{offer_follow_up}}.",
    variables: [
      { name: "tone", type: "enum", required: true, defaultValue: "friendly", options: ["friendly", "direct", "formal"] },
      { name: "customer_name", type: "string", required: true, defaultValue: "" },
      { name: "issue_summary", type: "text", required: true, defaultValue: "" },
      { name: "offer_follow_up", type: "boolean", required: true, defaultValue: true },
    ],
  },
  {
    id: "starter_prd_draft",
    use_case: "prd",
    name: "PRD draft",
    template:
      "Create a PRD for {{feature_name}}. Include problem statement, goals, non-goals, user stories for {{primary_user}}, launch risks, and success metrics.",
    variables: [
      { name: "feature_name", type: "string", required: true, defaultValue: "" },
      { name: "primary_user", type: "string", required: true, defaultValue: "" },
    ],
  },
];

function toLower(value) {
  return String(value ?? "").trim().toLowerCase();
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function suggestStarterTemplates({ useCase = "", query = "", limit = 6 } = {}) {
  const normalizedUseCase = toLower(useCase);
  const normalizedQuery = toLower(query);
  const normalizedLimit = Number.isFinite(limit) ? Math.max(1, Math.floor(limit)) : 6;

  const filtered = STARTER_TEMPLATES.filter((item) => {
    if (normalizedUseCase && item.use_case !== normalizedUseCase) {
      return false;
    }

    if (!normalizedQuery) return true;
    const haystack = `${item.use_case} ${item.name} ${item.template}`.toLowerCase();
    return haystack.includes(normalizedQuery);
  });

  return filtered.slice(0, normalizedLimit).map((item) => clone(item));
}
