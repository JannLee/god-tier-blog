import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Blog",
  description: "개발 경험과 인사이트를 기록하는 개인 블로그",
};

function Header() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-3xl px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-gray-900 hover:text-gray-600 transition-colors">
          Blog
        </Link>
        <nav className="flex gap-6 text-sm text-gray-600">
          <Link href="/" className="hover:text-gray-900 transition-colors">홈</Link>
          <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-gray-900 transition-colors">GitHub</a>
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white mt-auto">
      <div className="mx-auto max-w-3xl px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-gray-500">
        <p>© {new Date().getFullYear()} Blog. All rights reserved.</p>
        <div className="flex gap-4">
          <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-gray-900 transition-colors">GitHub</a>
        </div>
      </div>
    </footer>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col bg-white">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
