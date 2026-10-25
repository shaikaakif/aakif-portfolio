export interface GalleryImage {
  src: string;
  alt: string;
  title: string;
  caption?: string;
  category: string;
  date?: string;
  width: number;
  height: number;
}

export interface GalleryCategory {
  id: string;
  label: string;
  description?: string;
}

export const galleryCategories: GalleryCategory[] = [
  { id: "photography", label: "Photography", description: "Personal and travel photography" },
  { id: "events", label: "Events", description: "Conferences, meetups, and speaking engagements" },
  { id: "projects", label: "Project Screenshots", description: "UI/UX work and product screenshots" },
  { id: "work", label: "Work & Process", description: "Behind-the-scenes and workspace shots" },
];

export const galleryImages: GalleryImage[] = [];