import { RESOURCE_MIME_TYPE } from "@modelcontextprotocol/ext-apps/server";

export const INLINE_WIDGET_URI = "ui://widget/promptfill-inline-v1.html";
export const DEFAULT_WIDGET_DOMAIN = "https://promptfill.example.com";

const DEFAULT_WIDGET_CSP = Object.freeze({
  connectDomains: [],
  resourceDomains: ["https://persistent.oaistatic.com"],
});

export function normalizeWidgetDomain(value) {
  if (typeof value !== "string" || value.trim() === "") {
    return DEFAULT_WIDGET_DOMAIN;
  }

  try {
    const parsed = new URL(value);
    return parsed.origin;
  } catch {
    return DEFAULT_WIDGET_DOMAIN;
  }
}

export function getWidgetDomain(envValue = process.env.PROMPTFILL_WIDGET_DOMAIN) {
  return normalizeWidgetDomain(envValue);
}

export function createWidgetCsp() {
  return {
    connectDomains: [...DEFAULT_WIDGET_CSP.connectDomains],
    resourceDomains: [...DEFAULT_WIDGET_CSP.resourceDomains],
  };
}

export function createWidgetMeta({
  description,
  widgetDomain = getWidgetDomain(),
  prefersBorder = true,
} = {}) {
  const csp = createWidgetCsp();

  return {
    ui: {
      prefersBorder,
      domain: widgetDomain,
      csp,
    },
    "openai/widgetDescription": description,
    "openai/widgetPrefersBorder": prefersBorder,
    "openai/widgetDomain": widgetDomain,
    "openai/widgetCSP": {
      connect_domains: [...csp.connectDomains],
      resource_domains: [...csp.resourceDomains],
    },
  };
}

export function createToolTemplateMeta(resourceUri = INLINE_WIDGET_URI) {
  return {
    ui: { resourceUri },
    "openai/outputTemplate": resourceUri,
  };
}

export { RESOURCE_MIME_TYPE };
