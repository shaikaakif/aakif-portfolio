import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, FileTextIcon, GlobeIcon, SearchIcon } from "@/components/ui/icons";
import { projects as staticProjects } from "@/content/projects";
import { seo } from "@/content/seo";
import {
  getPublishedGalleryImages,
  getPublishedProjects,
} from "@/lib/content/cms";

export const metadata: Metadata = {
  title: "Sitemaps",
  description:
    "XML sitemap, robots file, and crawlable page index for Shaik Aakif — AI builder and product developer.",
  keywords: seo.keywords,
  alternates: {
    canonical: "/sitemaps/",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function SitemapsPage() {
  const [cmsProjects, images] = await Promise.all([
    getPublishedProjects(),
    getPublishedGalleryImages(),
  ]);

  const projects = cmsProjects.length > 0 ? cmsProjects : staticProjects;
  const pageCount = 4 + projects.length + images.length;

  return (
    <>
      <section className="page-hero" aria-labelledby="sitemaps-title">
        <div className="container">
          <p className="eyebrow">Sitemaps / crawl index</p>
          <h1 className="display-title" id="sitemaps-title">
            Every page, in one place.
          </h1>
          <div className="page-hero__sub">
            <p>
              Google reads the XML file at{" "}
              <code>/sitemap.xml</code>. Submit that URL in Google Search
              Console. This page is the human-readable index.
            </p>
          </div>
          <div className="page-hero__meta">
            <span className="role-pill">{pageCount} URLs</span>
            <span className="role-pill">{projects.length} projects</span>
            <span className="role-pill">{images.length} gallery images</span>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="sitemap-files-title">
        <div className="container">
          <h2 className="sr-only" id="sitemap-files-title">
            Sitemap files
          </h2>

          <div className="sitemap-grid">
            <a
              className="sitemap-card"
              href="/sitemap.xml"
              target="_blank"
              rel="noreferrer"
            >
              <GlobeIcon width={20} height={20} />
              <span>
                <strong>XML sitemap</strong>
                <small>/sitemap.xml — submit this to Google</small>
              </span>
              <ArrowUpRight width={16} height={16} />
            </a>

            <a
              className="sitemap-card"
              href="/robots.txt"
              target="_blank"
              rel="noreferrer"
            >
              <FileTextIcon width={20} height={20} />
              <span>
                <strong>robots.txt</strong>
                <small>Crawl rules and sitemap reference</small>
              </span>
              <ArrowUpRight width={16} height={16} />
            </a>

            <a
              className="sitemap-card"
              href="https://search.google.com/search-console"
              target="_blank"
              rel="noreferrer"
            >
              <SearchIcon width={20} height={20} />
              <span>
                <strong>Google Search Console</strong>
                <small>Submit the sitemap and request indexing</small>
              </span>
              <ArrowUpRight width={16} height={16} />
            </a>
          </div>
        </div>
      </section>

      <section className="section-tight" aria-labelledby="sitemap-pages-title">
        <div className="container sitemap-columns">
          <div className="sitemap-column">
            <h2 id="sitemap-pages-title">Pages</h2>
            <ul className="sitemap-list">
              <li>
                <Link prefetch={false} href="/">
                  Home
                </Link>
              </li>
              <li>
                <Link prefetch={false} href="/work/">
                  Work
                </Link>
              </li>
              <li>
                <Link prefetch={false} href="/about/">
                  About
                </Link>
              </li>
              <li>
                <Link prefetch={false} href="/gallery/">
                  Gallery
                </Link>
              </li>
            </ul>
          </div>

          <div className="sitemap-column">
            <h2>Projects</h2>
            <ul className="sitemap-list">
              {projects.map((project) => (
                <li key={project.slug}>
                  <Link prefetch={false} href={`/work/${project.slug}/`}>
                    {project.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="sitemap-column">
            <h2>Gallery images</h2>
            {images.length > 0 ? (
              <ul className="sitemap-list">
                {images.map((image) => (
                  <li key={image.id}>
                    <Link prefetch={false} href={`/gallery/${image.id}/`}>
                      {image.title}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="sitemap-empty">
                No published images yet. Published gallery images appear here
                automatically.
              </p>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
