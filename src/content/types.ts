export type ProjectStatus = "Live" | "Case study";
export type ProjectTone =
  | "clay"
  | "cobalt"
  | "sage"
  | "amber"
  | "rose"
  | "plum"
  | "ink";

export type ArtworkVariant =
  | "orbit"
  | "grid"
  | "wave"
  | "stack"
  | "aperture"
  | "fold"
  | "pulse";

export interface Project {
  slug: string;
  index: string;
  title: string;
  category: string;
  status: ProjectStatus;
  tagline: string;
  description: string;
  problem: string;
  solution: string;
  stack: string[];
  liveUrl?: string;
  githubUrl?: string;
  metric: string;
  tone: ProjectTone;
  artwork: ArtworkVariant;
  code: string;
  image?: string;
}

export interface Experiment {
  title: string;
  category: string;
  tagline: string;
  stack: string[];
  githubUrl?: string;
  liveUrl?: string;
  note?: string;
}

export interface FocusDomain {
  index: string;
  title: string;
  badge: string;
  description: string;
}

export interface Capability {
  domain: string;
  skills: string[];
}

export interface TimelineEntry {
  year: string;
  title: string;
  role: string;
  description: string;
}

export interface Achievement {
  title: string;
  category: string;
  description: string;
  year?: string;
}

export interface TeamRole {
  role: string;
  agent: string;
  badge: string;
  description: string;
}
