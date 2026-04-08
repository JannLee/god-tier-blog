import type { Metadata } from "next";
import "./globals.css";
import { getAllPosts } from "@/lib/posts";
import AppShell from "@/components/AppShell";

export const metadata: Metadata = {
  metadataBase: new URL("https://jannlee.github.io"),
  title: {
    default: "JannLee Blog",
    template: "%s | JannLee Blog",
  },
  description: "개발 경험과 인사이트를 기록하는 개인 블로그",
  openGraph: {
    siteName: "JannLee Blog",
    type: "website",
    locale: "ko_KR",
  },
  twitter: {
    card: "summary_large_image",
  },
};

// Static script constant — no user input, no XSS risk.
// Runs synchronously before React hydrates to apply saved theme class,
// preventing flash of unstyled content (FOUC) on static export.
const THEME_INIT_SCRIPT =
  "try{var t=localStorage.getItem('theme');" +
  "if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches))" +
  "{document.documentElement.classList.add('dark');}}catch(e){}";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const posts = getAllPosts();

  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        {/* Static theme-init script — safe constant string, prevents FOUC */}
        <script
          dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }}
        />
      </head>
      <body>
        <AppShell posts={posts}>{children}</AppShell>
      </body>
    </html>
  );
}
