import { createInMemoryTemplateStore, hasTemplateStoreInterface } from "./promptfill-core.js";
import { createSupabaseTemplateStore } from "./supabase-template-store.js";

const ADAPTER_FACTORIES = {
  memory: () => createInMemoryTemplateStore(),
  supabase: (options) => createSupabaseTemplateStore(options),
};

export function createTemplateStoreAdapter(kind = "memory", options = {}) {
  const normalizedKind = String(kind ?? "memory").trim().toLowerCase();
  const buildAdapter = ADAPTER_FACTORIES[normalizedKind];

  if (!buildAdapter) {
    throw new Error(`Unknown template store adapter kind: ${normalizedKind}`);
  }

  const adapter = buildAdapter(options);
  if (!hasTemplateStoreInterface(adapter)) {
    throw new Error(`Template store adapter "${normalizedKind}" does not satisfy required interface`);
  }

  return adapter;
}
