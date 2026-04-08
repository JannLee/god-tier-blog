import type { Metadata } from "next";
import "./globals.css";
import { getAllPosts } from "@/lib/posts";
import AppShell from "@/components/AppShell";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: SITE.name,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  alternates: {
    canonical: SITE.url,
  },
  openGraph: {
    siteName: SITE.name,
    type: "website",
    locale: SITE.locale,
    url: SITE.url,
    title: SITE.name,
    description: SITE.description,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.name,
    description: SITE.description,
  },
};

// Static script constant — no user input, no XSS risk.
// Runs synchronously before React hydrates to apply saved theme class,
// preventing flash of unstyled content (FOUC) on static export.
const THEME_INIT_SCRIPT =
  "try{var t=localStorage.getItem('theme');" +
  "if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches))" +
  "{document.documentElement.classList.add('dark');}}catch(e){}";

// All values come from the SITE constant (trusted compile-time config, not user input).
// JSON.stringify escapes all special characters, so XSS is not possible here.
const WEBSITE_JSON_LD = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE.name,
  url: SITE.url,
  description: SITE.description,
  inLanguage: "ko",
  author: {
    "@type": "Person",
    name: SITE.author.name,
    url: SITE.author.url,
  },
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const posts = getAllPosts();

  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        {/* Static theme-init: safe constant, no user input — prevents FOUC */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        {/* WebSite JSON-LD: safe constant from SITE config, JSON.stringify escapes output */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: WEBSITE_JSON_LD }} />
      </head>
      <body>
        <AppShell posts={posts}>{children}</AppShell>
      </body>
    </html>
  );
}
