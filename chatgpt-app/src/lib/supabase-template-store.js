import { createClient } from "@supabase/supabase-js";

const DEFAULT_TABLE = "promptfill_templates";
const DEFAULT_OWNER_ID = "promptfill_single_tenant";

function required(value, name) {
  const normalized = typeof value === "string" ? value.trim() : "";
  if (!normalized) {
    throw new Error(`${name} is required for supabase template store.`);
  }
  return normalized;
}

function normalizeOwnerId(ownerId) {
  return required(ownerId ?? DEFAULT_OWNER_ID, "single-tenant owner id");
}

function normalizeTableName(tableName) {
  return required(tableName ?? DEFAULT_TABLE, "supabase table name");
}

function mapRowToTemplate(row) {
  if (!row || typeof row !== "object") return null;
  return {
    id: row.id,
    name: row.name,
    template: row.template,
    variables: Array.isArray(row.variables) ? row.variables : [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function getSupabaseClient(options) {
  if (options.client) return options.client;

  const url = required(options.url ?? process.env.PROMPTFILL_SUPABASE_URL, "PROMPTFILL_SUPABASE_URL");
  const key = required(options.key ?? process.env.PROMPTFILL_SUPABASE_KEY, "PROMPTFILL_SUPABASE_KEY");

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

export function createSupabaseTemplateStore(options = {}) {
  const ownerId = normalizeOwnerId(options.ownerId ?? process.env.PROMPTFILL_SINGLE_TENANT_USER_ID);
  const table = normalizeTableName(options.table ?? process.env.PROMPTFILL_SUPABASE_TABLE);
  const supabase = getSupabaseClient(options);

  return {
    async saveTemplate(template) {
      if (!template || !template.id) {
        throw new Error("Template id is required.");
      }

      const nowIso = new Date().toISOString();
      const row = {
        id: template.id,
        owner_id: ownerId,
        name: template.name,
        template: template.template,
        variables: Array.isArray(template.variables) ? template.variables : [],
        created_at: template.createdAt ?? nowIso,
        updated_at: nowIso,
      };

      const { data, error } = await supabase
        .from(table)
        .upsert(row, { onConflict: "owner_id,id" })
        .select("id,name,template,variables,created_at,updated_at")
        .single();

      if (error) {
        throw new Error(`Supabase saveTemplate failed: ${error.message}`);
      }

      return mapRowToTemplate(data ?? row);
    },

    async listTemplates() {
      const { data, error } = await supabase
        .from(table)
        .select("id,name,template,variables,created_at,updated_at")
        .eq("owner_id", ownerId)
        .order("created_at", { ascending: true });

      if (error) {
        throw new Error(`Supabase listTemplates failed: ${error.message}`);
      }

      return (Array.isArray(data) ? data : []).map((row) => mapRowToTemplate(row)).filter(Boolean);
    },

    async getTemplate(id) {
      if (!id) return null;

      const { data, error } = await supabase
        .from(table)
        .select("id,name,template,variables,created_at,updated_at")
        .eq("owner_id", ownerId)
        .eq("id", id)
        .maybeSingle();

      if (error) {
        throw new Error(`Supabase getTemplate failed: ${error.message}`);
      }

      return mapRowToTemplate(data);
    },

    async updateTemplate(id, updates = {}) {
      const existing = await this.getTemplate(id);
      if (!existing) return null;

      const next = {
        ...existing,
        ...updates,
        id: existing.id,
        variables:
          updates.variables === undefined
            ? existing.variables
            : Array.isArray(updates.variables)
              ? updates.variables
              : [],
        createdAt: existing.createdAt,
      };

      return this.saveTemplate(next);
    },

    async deleteTemplate(id) {
      if (!id) return false;
      const { error, count } = await supabase
        .from(table)
        .delete({ count: "exact" })
        .eq("owner_id", ownerId)
        .eq("id", id);

      if (error) {
        throw new Error(`Supabase deleteTemplate failed: ${error.message}`);
      }

      if (typeof count === "number") return count > 0;
      const stillExists = await this.getTemplate(id);
      return stillExists === null;
    },

    async searchTemplates(query, options = {}) {
      const normalized = String(query ?? "").trim().toLowerCase();
      const limit = Number.isFinite(options.limit) ? Math.max(1, Math.floor(options.limit)) : 25;
      const listed = await this.listTemplates();

      if (!normalized) {
        return listed.slice(0, limit);
      }

      return listed
        .filter((template) => {
          const variableNames = Array.isArray(template.variables)
            ? template.variables.map((item) => item?.name ?? "").join(" ")
            : "";
          const haystack = `${template.name ?? ""} ${template.template ?? ""} ${variableNames}`.toLowerCase();
          return haystack.includes(normalized);
        })
        .slice(0, limit);
    },
  };
}
