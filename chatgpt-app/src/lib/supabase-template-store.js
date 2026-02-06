function notConfiguredError(operation) {
  return new Error(
    `Supabase template store stub cannot ${operation} yet. Configure a real backend adapter in P1.`
  );
}

export function createSupabaseTemplateStore() {
  return {
    saveTemplate() {
      throw notConfiguredError("save templates");
    },
    listTemplates() {
      throw notConfiguredError("list templates");
    },
    getTemplate() {
      throw notConfiguredError("get templates");
    },
  };
}
