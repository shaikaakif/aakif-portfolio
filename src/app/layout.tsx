import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Outfit } from "next/font/google";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { BrushGlowTracker } from "@/components/ui/brush-glow-tracker";
import { MobileHighlighter } from "@/components/ui/mobile-highlighter";
import { achievements, profile } from "@/content/profile";
import { seo } from "@/content/seo";

import "./globals.css";
import "@/styles/core.css";
import "@/styles/shell.css";
import "@/styles/shell-pages.css";
import "@/styles/hero.css";
import "@/styles/work.css";
import "@/styles/about.css";
import "@/styles/contact.css";
import "@/styles/case.css";
import "@/styles/responsive.css";
import "@/styles/motion.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(seo.baseUrl),
  title: {
    default: seo.title,
    template: seo.titleTemplate,
  },
  description: seo.description,
  keywords: [...seo.keywords],
  authors: [{ name: seo.author, url: seo.baseUrl }],
  creator: seo.author,
  publisher: seo.author,
  category: "technology",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: profile.name,
    title: seo.title,
    description: seo.description,
    images: [
      {
        url: seo.ogImage,
        width: 1200,
        height: 630,
        alt: seo.ogImageAlt,
      },
    ],
  },
  twitter: {
    card: seo.twitterCard,
    title: seo.title,
    description: seo.description,
    images: [seo.ogImage],
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-icon.png", sizes: "180x180" }],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: seo.themeColor,
  colorScheme: "light",
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "ProfilePage",
  mainEntity: {
    "@type": "Person",
    name: profile.name,
    url: seo.baseUrl,
    email: `mailto:${profile.email}`,
    jobTitle: "AI Builder & Product Developer",
    description: seo.description,
    knowsAbout: [
      "Artificial Intelligence",
      "Generative AI",
      "Machine Learning",
      "Computer Vision",
      "Full-Stack Development",
      "Web Development",
      "Entrepreneurship",
      "Product Development",
    ],
    award: achievements.map((achievement) => achievement.title),
    sameAs: [profile.github, profile.linkedin, profile.instagram],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${outfit.variable} ${jetbrains.variable}`}
      >
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <div className="scroll-progress" aria-hidden="true" />
        <div className="aurora-glow" aria-hidden="true" />
        <div className="brush-glow" aria-hidden="true" />
        <BrushGlowTracker />
        <MobileHighlighter />
        <SiteHeader />
        <main id="main-content">{children}</main>
        <SiteFooter />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </body>
    </html>
  );
}
