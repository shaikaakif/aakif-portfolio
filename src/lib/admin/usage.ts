import type { ProjectRecord, UsageMap } from "@/lib/admin/types";

export function buildUsageMap(projects: ProjectRecord[]): UsageMap {
  const usage: UsageMap = {};

  const add = (
    imageId: string | null | undefined,
    project: ProjectRecord,
    role: "cover" | "screenshot" | "social"
  ) => {
    if (!imageId) return;
    const entries = usage[imageId] ?? [];
    const existing = entries.find((entry) => entry.projectId === project.id);
    if (existing) {
      if (!existing.roles.includes(role)) existing.roles.push(role);
      return;
    }
    entries.push({
      projectId: project.id,
      projectTitle: project.title,
      projectSlug: project.slug,
      published: Boolean(project.published_at),
      roles: [role],
    });
    usage[imageId] = entries;
  };

  for (const project of projects) {
    add(project.cover_image_id, project, "cover");
    add(project.seo_image_id, project, "social");
    for (const screenshotId of project.screenshot_ids ?? []) {
      add(screenshotId, project, "screenshot");
    }
  }

  return usage;
}

export function usageLabel(roles: Array<"cover" | "screenshot" | "social">): string {
  const labels: Record<string, string> = {
    cover: "cover",
    screenshot: "screenshot",
    social: "social image",
  };
  return roles.map((role) => labels[role]).join(", ");
}
