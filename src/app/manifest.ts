import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Shaik Aakif — AI Builder & Product Developer",
    short_name: "Shaik Aakif",
    description:
      "Products and systems by Shaik Aakif across AI, full-stack software, computer vision, and product design.",
    start_url: "/",
    display: "standalone",
    background_color: "#f4f0e8",
    theme_color: "#f4f0e8",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    lang: "en",
    categories: ["portfolio", "technology", "software"],
  };
}

export const dynamic = "force-static";

