import { createClient } from "@supabase/supabase-js";

const DEFAULT_TABLE = "promptfill_templates";
const DEFAULT_VERSION_TABLE = "promptfill_template_versions";
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

function normalizeVersionTableName(tableName) {
  return required(tableName ?? DEFAULT_VERSION_TABLE, "supabase version table name");
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

function mapVersionRow(row) {
  if (!row || typeof row !== "object") return null;
  return {
    version_id: row.version_id,
    version_number: row.version_number,
    template_id: row.template_id,
    name: row.name,
    template: row.template,
    variables: Array.isArray(row.variables) ? row.variables : [],
    created_at: row.created_at,
    updated_at: row.updated_at,
    snapshot_at: row.snapshot_at,
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
  const versionTable = normalizeVersionTableName(
    options.versionTable ?? process.env.PROMPTFILL_SUPABASE_VERSION_TABLE
  );
  const supabase = getSupabaseClient(options);

  async function listTemplateVersionRows(templateId) {
    const { data, error } = await supabase
      .from(versionTable)
      .select(
        "version_id,version_number,template_id,name,template,variables,created_at,updated_at,snapshot_at"
      )
      .eq("owner_id", ownerId)
      .eq("template_id", templateId);

    if (error) {
      throw new Error(`Supabase listTemplateVersions failed: ${error.message}`);
    }

    return Array.isArray(data) ? data : [];
  }

  async function appendTemplateVersion(template) {
    const existingVersions = await listTemplateVersionRows(template.id);
    const highestVersion = existingVersions.reduce(
      (max, row) => Math.max(max, Number(row.version_number) || 0),
      0
    );
    const nextVersion = highestVersion + 1;
    const versionId = `ver_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

    const { error } = await supabase.from(versionTable).insert({
      owner_id: ownerId,
      template_id: template.id,
      version_id: versionId,
      version_number: nextVersion,
      name: template.name,
      template: template.template,
      variables: Array.isArray(template.variables) ? template.variables : [],
      created_at: template.createdAt,
      updated_at: template.updatedAt ?? null,
      snapshot_at: new Date().toISOString(),
    });

    if (error) {
      throw new Error(`Supabase append version failed: ${error.message}`);
    }
  }

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

      const mapped = mapRowToTemplate(data ?? row);
      if (mapped) {
        await appendTemplateVersion(mapped);
      }
      return mapped;
    },

    async listTemplates() {
      const { data, error } = await supabase
        .from(table)
        .select("id,name,template,variables,created_at,updated_at")
        .eq("owner_id", ownerId);

      if (error) {
        throw new Error(`Supabase listTemplates failed: ${error.message}`);
      }

      return (Array.isArray(data) ? data : [])
        .map((row) => mapRowToTemplate(row))
        .filter(Boolean)
        .sort((a, b) => String(a.createdAt ?? "").localeCompare(String(b.createdAt ?? "")));
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

      const versionDelete = await supabase
        .from(versionTable)
        .delete({ count: "exact" })
        .eq("owner_id", ownerId)
        .eq("template_id", id);

      if (versionDelete?.error) {
        throw new Error(`Supabase deleteTemplate versions cleanup failed: ${versionDelete.error.message}`);
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

    async listTemplateVersions(templateId, options = {}) {
      if (!templateId) return [];
      const limit = Number.isFinite(options.limit) ? Math.max(1, Math.floor(options.limit)) : 20;
      const rows = await listTemplateVersionRows(templateId);
      return rows
        .map((row) => mapVersionRow(row))
        .filter(Boolean)
        .sort((a, b) => (Number(b.version_number) || 0) - (Number(a.version_number) || 0))
        .slice(0, limit);
    },

    async restoreTemplateVersion(templateId, versionId) {
      if (!templateId || !versionId) return null;
      const versions = await this.listTemplateVersions(templateId, { limit: 200 });
      const version = versions.find((item) => item.version_id === versionId);
      if (!version) return null;

      const current = await this.getTemplate(templateId);
      return this.saveTemplate({
        id: templateId,
        name: version.name,
        template: version.template,
        variables: version.variables,
        createdAt: current?.createdAt ?? version.created_at ?? new Date().toISOString(),
      });
    },
  };
}
