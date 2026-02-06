import { createInMemoryTemplateStore, hasTemplateStoreInterface } from "./promptfill-core.js";
import { createSupabaseTemplateStore } from "./supabase-template-store.js";

const ADAPTER_FACTORIES = {
  memory: () => createInMemoryTemplateStore(),
  supabase: () => createSupabaseTemplateStore(),
};

export function createTemplateStoreAdapter(kind = "memory") {
  const normalizedKind = String(kind ?? "memory").trim().toLowerCase();
  const buildAdapter = ADAPTER_FACTORIES[normalizedKind];

  if (!buildAdapter) {
    throw new Error(`Unknown template store adapter kind: ${normalizedKind}`);
  }

  const adapter = buildAdapter();
  if (!hasTemplateStoreInterface(adapter)) {
    throw new Error(`Template store adapter "${normalizedKind}" does not satisfy required interface`);
  }

  return adapter;
}
