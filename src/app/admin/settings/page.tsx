"use client";

import { useState } from "react";
import { MailIcon, GlobeIcon, SaveIcon } from "@/components/ui/icons";

export default function AdminSettings() {
  const [saved, setSaved] = useState(false);

  return (
    <div className="admin-settings">
      <div className="admin-page-header">
        <div className="admin-header-content">
          <h1 className="admin-page-title">Settings</h1>
          <p className="admin-page-subtitle">Configure your portfolio site preferences.</p>
        </div>
      </div>

      <div className="admin-settings-grid">
        <div className="admin-settings-card">
          <h2 className="admin-settings-section-title">Site Identity</h2>
          <div className="admin-form-group">
            <label className="admin-form-label">Site Name</label>
            <input type="text" className="input" defaultValue="Shaik Aakif" />
          </div>
          <div className="admin-form-group">
            <label className="admin-form-label">Role / Tagline</label>
            <input type="text" className="input" defaultValue="AI Builder & Product Developer" />
          </div>
          <div className="admin-form-group">
            <label className="admin-form-label">Email</label>
            <input type="email" className="input" defaultValue="aakifshaik512@gmail.com" />
          </div>
        </div>

        <div className="admin-settings-card">
          <h2 className="admin-settings-section-title">Social Links</h2>
          <div className="admin-form-group">
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <GlobeIcon width={18} height={18} style={{ color: "var(--muted)" }} />
              <input type="url" className="input" defaultValue="https://shaikaakif.com" />
            </div>
          </div>
          <div className="admin-form-group">
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <MailIcon width={18} height={18} style={{ color: "var(--muted)" }} />
              <input type="url" className="input" defaultValue="https://github.com/shaikaakif" />
            </div>
          </div>
        </div>

        <div className="admin-settings-card">
          <h2 className="admin-settings-section-title">Appearance</h2>
          <div className="admin-form-group">
            <label className="admin-form-label">Theme Color</label>
            <input type="color" className="input" defaultValue="#f4f0e8" />
          </div>
        </div>

        <div className="admin-settings-card">
          <h2 className="admin-settings-section-title">Danger Zone</h2>
          <div className="admin-form-group">
            <button className="button button--ghost" style={{ color: "var(--accent-deep)" }}>
              Reset All Settings
            </button>
          </div>
        </div>
      </div>

      <div className="admin-settings-actions">
        <button
          onClick={() => {
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
          }}
          className="button button--primary"
        >
          <SaveIcon width={16} height={16} />
          Save Changes
        </button>
        {saved && (
          <span className="admin-saved-badge">Saved</span>
        )}
      </div>

      <style jsx>{`
        .admin-settings {
          max-width: 100%;
        }

        .admin-page-header {
          margin-bottom: 2.5rem;
        }

        .admin-page-header h1 {
          font-size: clamp(1.75rem, 3vw, 2.25rem);
          font-weight: 500;
          letter-spacing: -0.02em;
          margin: 0 0 0.25rem;
        }

        .admin-page-header p {
          color: var(--ink-soft);
          font-size: 1rem;
          margin: 0;
        }

        .admin-settings-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2.5rem;
        }

        .admin-settings-card {
          border: 1px solid var(--line);
          border-radius: var(--radius-lg);
          background: var(--paper-soft);
          padding: 1.5rem;
        }

        .admin-settings-section-title {
          font-size: 1rem;
          font-weight: 500;
          margin: 0 0 1rem;
          font-family: var(--font-outfit), sans-serif;
        }

        .admin-form-group {
          margin-bottom: 1rem;
        }

        .admin-form-label {
          display: block;
          font-size: 0.8rem;
          color: var(--ink);
          font-weight: 500;
          font-family: var(--font-jetbrains), ui-monospace, monospace;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.5rem;
        }

        .admin-settings-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .admin-saved-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.4rem 0.8rem;
          background: var(--success);
          color: var(--paper-soft);
          border-radius: var(--radius-md);
          font-size: 0.75rem;
          font-weight: 500;
          font-family: var(--font-jetbrains), ui-monospace, monospace;
          animation: saved-fade 200ms ease forwards;
        }

        @keyframes saved-fade {
          0% { opacity: 0; transform: translateY(0.5rem); }
          100% { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 48rem) {
          .admin-settings-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}