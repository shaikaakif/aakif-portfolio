"use client";

import { useEffect, useState, useCallback } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { PlusIcon, TrashIcon, EditIcon, FolderIcon, FilterIcon, SearchIcon } from "@/components/ui/icons";
import { ProjectFormModal, type ProjectRecord } from "@/components/admin/ProjectFormModal";

export default function ProjectManager() {
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectRecord | null>(null);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      let query = supabase.from("projects").select("*").order("sort_order", { ascending: true });

      if (statusFilter === "published") {
        query = query.not("published_at", "is", null);
      } else if (statusFilter === "draft") {
        query = query.is("published_at", null);
      }

      const { data, error: err } = await query;
      if (err) throw err;
      setProjects(data ?? []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load projects");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      try {
        const supabase = createSupabaseBrowserClient();
        let query = supabase
          .from("projects")
          .select("*")
          .order("sort_order", { ascending: true });

        if (statusFilter === "published") {
          query = query.not("published_at", "is", null);
        } else if (statusFilter === "draft") {
          query = query.is("published_at", null);
        }

        const { data, error: err } = await query;
        if (err) throw err;
        if (!ignore) setProjects(data ?? []);
      } catch (err: unknown) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : "Failed to load projects");
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    load();
    return () => {
      ignore = true;
    };
  }, [statusFilter]);

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tagline.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "published" && p.published_at !== null) ||
      (statusFilter === "draft" && p.published_at === null);
    return matchesSearch && matchesStatus;
  });

  const handlePublish = async (id: string, publish: boolean) => {
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase
        .from("projects")
        .update({ published_at: publish ? new Date().toISOString() : null })
        .eq("id", id);

      if (error) {
        setError(error.message);
        return;
      }
      fetchProjects();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.from("projects").delete().eq("id", id);
      if (error) {
        setError(error.message);
        return;
      }
      fetchProjects();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  };

  const handleFeature = async (id: string, featured: boolean) => {
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase
        .from("projects")
        .update({ featured })
        .eq("id", id);
      if (error) setError(error.message);
      else fetchProjects();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update");
    }
  };

  return (
    <div className="admin-project-manager">
      <div className="admin-page-header">
        <div className="admin-header-content">
          <h1 className="admin-page-title">Projects</h1>
          <p className="admin-page-subtitle">Manage your portfolio projects and case studies.</p>
        </div>
        <button
          type="button"
          className="button button--primary"
          onClick={() => {
            setEditingProject(null);
            setShowForm(true);
          }}
        >
          <PlusIcon width={16} height={16} />
          New Project
        </button>
      </div>

      {error && (
        <div className="admin-error-banner" role="alert">{error}</div>
      )}

      <div className="admin-project-toolbar">
        <div className="admin-search-box">
          <SearchIcon width={18} height={18} style={{ color: "var(--muted)", marginRight: "0.75rem" }} />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input"
            style={{ paddingLeft: "2.5rem" }}
          />
        </div>
        <div className="admin-filter-group">
          <FilterIcon width={18} height={18} style={{ color: "var(--muted)", marginRight: "0.75rem" }} />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input">
            <option value="all">All Projects</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
          </select>
        </div>
      </div>

      <div className="admin-projects-list" role="list" aria-label="Projects">
        {loading && (
          <div className="admin-loading">Loading projects...</div>
        )}
        {!loading && filteredProjects.length === 0 && (
          <div className="admin-empty-state">
            <FolderIcon width={48} height={48} style={{ color: "var(--muted)" }} />
            <p>No projects found</p>
          </div>
        )}
        {!loading && filteredProjects.map((project) => (
          <div key={project.id} className="admin-project-row">
            <div className="admin-project-info">
              <div className="admin-project-avatar" aria-hidden="true">
                {project.code ? project.code : project.title.charAt(0).toUpperCase()}
              </div>
              <div className="admin-project-details">
                <h3 className="admin-project-title">{project.title}</h3>
                <p className="admin-project-tagline">{project.tagline}</p>
                <div className="admin-project-meta">
                  <span className="admin-project-category">{project.category}</span>
                  <span className="admin-project-status">{project.status}</span>
                  <span className="admin-project-slug">/{project.slug}/</span>
                </div>
              </div>
            </div>
            <div className="admin-project-actions">
              <button
                type="button"
                onClick={() => {
                  setEditingProject(project);
                  setShowForm(true);
                }}
                className="admin-link-btn"
                title="Edit project"
              >
                <EditIcon width={16} height={16} />
              </button>
              <button
                onClick={() => handleFeature(project.id, !project.featured)}
                className={`admin-link-btn ${project.featured ? "featured" : ""}`}
                title={project.featured ? "Unfeature" : "Feature"}
              >
                <span style={{ fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {project.featured ? "★" : "☆"}
                </span>
              </button>
              <button
                onClick={() => handlePublish(project.id, !project.published_at)}
                className={`admin-link-btn ${project.published_at ? "published" : ""}`}
                title={project.published_at ? "Unpublish" : "Publish"}
              >
                <span style={{ fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {project.published_at ? "●" : "○"}
                </span>
              </button>
              <button onClick={() => handleDelete(project.id)} className="admin-link-btn admin-link-btn--delete" title="Delete">
                <TrashIcon width={16} height={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <ProjectFormModal
          project={editingProject}
          onClose={() => {
            setShowForm(false);
            setEditingProject(null);
          }}
          onSaved={fetchProjects}
        />
      )}
    </div>
  );
}