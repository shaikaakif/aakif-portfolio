"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshIcon, SaveIcon } from "@/components/ui/icons";
import {
  AdminAlert,
  AdminField,
  AdminLoading,
  AdminPageHeader,
  useAdminToast,
} from "@/components/admin/ui/AdminUi";
import { parseCommaList } from "@/lib/admin/format";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { SiteSettings } from "@/lib/admin/types";

const DEFAULT_SETTINGS: SiteSettings = {
  site_identity: {
    name: "Shaik Aakif",
    tagline: "AI Builder & Product Developer",
    email: "aakifshaik512@gmail.com",
  },
  seo_defaults: {
    title: "Shaik Aakif — AI Builder & Product Developer",
    description:
      "Shaik Aakif is an AI builder, product developer and entrepreneur building AI-powered products, full-stack applications and intelligent systems.",
  },
  social_links: {
    website: "https://shaikaakif.com",
    github: "https://github.com/shaikaakif",
    linkedin: "",
    instagram: "",
  },
  gallery_defaults: {
    defaultStatus: "draft",
    defaultCategories: [],
  },
  publishing: {
    requireAltText: true,
    autoPublishOnUpload: false,
  },
};

function mergeSettings(rows: Array<{ key: string; value: unknown }>) {
  const merged: SiteSettings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));

  for (const row of rows) {
    if (!(row.key in merged)) continue;
    const key = row.key as keyof SiteSettings;
    const current = merged[key] as unknown as Record<string, unknown>;
    const value = row.value as Record<string, unknown> | null;
    if (!value || typeof value !== "object") continue;
    (merged as unknown as Record<string, Record<string, unknown>>)[key] = {
      ...current,
      ...value,
    };
  }

  return merged;
}

export default function AdminSettingsPage() {
  const { push } = useAdminToast();
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [baseline, setBaseline] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [setupMissing, setSetupMissing] = useState(false);
  const [categoryText, setCategoryText] = useState("");

  const load = useCallback(async () => {
    try {
      const supabase = createSupabaseBrowserClient();
      const { data, error: loadError } = await supabase
        .from("site_settings")
        .select("key,value");

      if (loadError) {
        if (
          loadError.code === "42P01" ||
          /does not exist|schema cache/i.test(loadError.message)
        ) {
          setSetupMissing(true);
          setSettings(DEFAULT_SETTINGS);
          setBaseline(DEFAULT_SETTINGS);
          setCategoryText("");
          return;
        }
        throw loadError;
      }

      const merged = mergeSettings(
        (data as Array<{ key: string; value: unknown }>) ?? []
      );
      setSettings(merged);
      setBaseline(merged);
      setCategoryText(merged.gallery_defaults.defaultCategories.join(", "));
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Could not load site settings."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- data fetch resolves asynchronously
    void load();
  }, [load]);

  const dirty = JSON.stringify(settings) !== JSON.stringify(baseline);

  const updateGroup = <K extends keyof SiteSettings>(
    key: K,
    patch: Partial<SiteSettings[K]>
  ) => {
    setSettings((current) => ({
      ...current,
      [key]: { ...current[key], ...patch },
    }));
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (setupMissing || !dirty) return;

    setSaving(true);
    setError(null);
    const supabase = createSupabaseBrowserClient();
    const keys = (Object.keys(settings) as Array<keyof SiteSettings>).filter(
      (key) => JSON.stringify(settings[key]) !== JSON.stringify(baseline[key])
    );

    const rows = keys.map((key) => ({
      key,
      value: settings[key],
    }));

    const { error: saveError } = await supabase
      .from("site_settings")
      .upsert(rows, { onConflict: "key" });
    setSaving(false);

    if (saveError) {
      setError(saveError.message);
      push("Settings were not saved.", "error");
      return;
    }

    setBaseline(settings);
    push("Settings saved.", "success");
  };

  const handleReset = () => {
    setSettings(baseline);
    setCategoryText(baseline.gallery_defaults.defaultCategories.join(", "));
  };

  return (
    <div className="admin-page">
      <AdminPageHeader
        eyebrow="Configuration"
        title="Settings"
        description="Defaults used by the admin workflows and, where supported, the public site build."
        actions={
          <button
            type="button"
            className="admin-button admin-button--ghost"
            onClick={() => {
              setLoading(true);
              setError(null);
              setSetupMissing(false);
              void load();
            }}
            disabled={loading || saving}
          >
            <RefreshIcon width={16} height={16} />
            Reload
          </button>
        }
      />

      {setupMissing ? (
        <AdminAlert tone="error">
          <strong>Settings table not found.</strong> Run{" "}
          <code>supabase/migrations/006_site_settings.sql</code> in the Supabase
          SQL Editor, then reload this page. Saving is disabled until the table
          exists.
        </AdminAlert>
      ) : null}

      {error ? <AdminAlert tone="error">{error}</AdminAlert> : null}

      {loading ? (
        <AdminLoading label="Loading settings…" />
      ) : (
        <form onSubmit={handleSave}>
          <div className="admin-settings-grid">
            <section className="admin-settings-card">
              <div>
                <h2 className="admin-settings-card__title">Site identity</h2>
                <p className="admin-settings-card__desc">
                  The name, role, and contact email shown across the portfolio.
                </p>
              </div>
              <AdminField label="Name" htmlFor="settings-name">
                <input
                  id="settings-name"
                  className="admin-input"
                  value={settings.site_identity.name}
                  onChange={(event) =>
                    updateGroup("site_identity", { name: event.target.value })
                  }
                  disabled={setupMissing}
                />
              </AdminField>
              <AdminField label="Role / tagline" htmlFor="settings-tagline">
                <input
                  id="settings-tagline"
                  className="admin-input"
                  value={settings.site_identity.tagline}
                  onChange={(event) =>
                    updateGroup("site_identity", {
                      tagline: event.target.value,
                    })
                  }
                  disabled={setupMissing}
                />
              </AdminField>
              <AdminField label="Email" htmlFor="settings-email">
                <input
                  id="settings-email"
                  type="email"
                  className="admin-input"
                  value={settings.site_identity.email}
                  onChange={(event) =>
                    updateGroup("site_identity", { email: event.target.value })
                  }
                  disabled={setupMissing}
                />
              </AdminField>
            </section>

            <section className="admin-settings-card">
              <div>
                <h2 className="admin-settings-card__title">Default SEO</h2>
                <p className="admin-settings-card__desc">
                  Used when a page or project does not provide its own metadata.
                </p>
              </div>
              <AdminField label="Title" htmlFor="settings-seo-title">
                <input
                  id="settings-seo-title"
                  className="admin-input"
                  value={settings.seo_defaults.title}
                  onChange={(event) =>
                    updateGroup("seo_defaults", { title: event.target.value })
                  }
                  disabled={setupMissing}
                />
              </AdminField>
              <AdminField
                label="Description"
                htmlFor="settings-seo-description"
              >
                <textarea
                  id="settings-seo-description"
                  className="admin-textarea"
                  rows={3}
                  value={settings.seo_defaults.description}
                  onChange={(event) =>
                    updateGroup("seo_defaults", {
                      description: event.target.value,
                    })
                  }
                  disabled={setupMissing}
                />
              </AdminField>
            </section>

            <section className="admin-settings-card">
              <div>
                <h2 className="admin-settings-card__title">Social links</h2>
                <p className="admin-settings-card__desc">
                  Public profiles linked from the portfolio.
                </p>
              </div>
              <AdminField label="Website" htmlFor="settings-website">
                <input
                  id="settings-website"
                  type="url"
                  className="admin-input"
                  value={settings.social_links.website}
                  onChange={(event) =>
                    updateGroup("social_links", {
                      website: event.target.value,
                    })
                  }
                  disabled={setupMissing}
                />
              </AdminField>
              <AdminField label="GitHub" htmlFor="settings-github">
                <input
                  id="settings-github"
                  type="url"
                  className="admin-input"
                  value={settings.social_links.github}
                  onChange={(event) =>
                    updateGroup("social_links", { github: event.target.value })
                  }
                  disabled={setupMissing}
                />
              </AdminField>
              <AdminField label="LinkedIn" htmlFor="settings-linkedin">
                <input
                  id="settings-linkedin"
                  type="url"
                  className="admin-input"
                  value={settings.social_links.linkedin}
                  onChange={(event) =>
                    updateGroup("social_links", {
                      linkedin: event.target.value,
                    })
                  }
                  disabled={setupMissing}
                />
              </AdminField>
              <AdminField label="Instagram" htmlFor="settings-instagram">
                <input
                  id="settings-instagram"
                  type="url"
                  className="admin-input"
                  value={settings.social_links.instagram}
                  onChange={(event) =>
                    updateGroup("social_links", {
                      instagram: event.target.value,
                    })
                  }
                  disabled={setupMissing}
                />
              </AdminField>
            </section>

            <section className="admin-settings-card">
              <div>
                <h2 className="admin-settings-card__title">Gallery defaults</h2>
                <p className="admin-settings-card__desc">
                  Applied to new uploads in the Gallery and Media Library.
                </p>
              </div>
              <AdminField
                label="Default status"
                htmlFor="settings-gallery-status"
                hint="Publishing still requires the image to be published explicitly."
              >
                <select
                  id="settings-gallery-status"
                  className="admin-select"
                  value={settings.gallery_defaults.defaultStatus}
                  onChange={(event) =>
                    updateGroup("gallery_defaults", {
                      defaultStatus: event.target.value as "draft" | "published",
                    })
                  }
                  disabled={setupMissing}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </AdminField>
              <AdminField
                label="Default categories"
                htmlFor="settings-gallery-categories"
                hint="Comma-separated. Leave blank for none."
              >
                <input
                  id="settings-gallery-categories"
                  className="admin-input"
                  value={categoryText}
                  onChange={(event) => {
                    setCategoryText(event.target.value);
                    updateGroup("gallery_defaults", {
                      defaultCategories: parseCommaList(event.target.value),
                    });
                  }}
                  disabled={setupMissing}
                />
              </AdminField>
            </section>

            <section className="admin-settings-card">
              <div>
                <h2 className="admin-settings-card__title">Publishing</h2>
                <p className="admin-settings-card__desc">
                  Guardrails for uploads and public visibility.
                </p>
              </div>
              <label className="admin-checkbox admin-checkbox--boxed">
                <input
                  type="checkbox"
                  checked={settings.publishing.requireAltText}
                  onChange={(event) =>
                    updateGroup("publishing", {
                      requireAltText: event.target.checked,
                    })
                  }
                  disabled={setupMissing}
                />
                Require alt text before an image can be uploaded
              </label>
              <label className="admin-checkbox admin-checkbox--boxed">
                <input
                  type="checkbox"
                  checked={settings.publishing.autoPublishOnUpload}
                  onChange={(event) =>
                    updateGroup("publishing", {
                      autoPublishOnUpload: event.target.checked,
                    })
                  }
                  disabled={setupMissing}
                />
                Publish new uploads immediately
              </label>
            </section>
          </div>

          <div className="admin-settings-actions" style={{ marginTop: "1rem" }}>
            <button
              type="submit"
              className="admin-button admin-button--primary"
              disabled={setupMissing || saving || !dirty}
            >
              <SaveIcon width={16} height={16} />
              {saving ? "Saving…" : "Save changes"}
            </button>
            <button
              type="button"
              className="admin-button admin-button--ghost"
              onClick={handleReset}
              disabled={saving || !dirty}
            >
              Reset to saved values
            </button>
            {dirty ? (
              <span className="admin-toolbar__count">Unsaved changes</span>
            ) : null}
          </div>
        </form>
      )}
    </div>
  );
}
