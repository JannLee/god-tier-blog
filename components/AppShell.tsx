'use client'

import { useState } from 'react'
import Link from 'next/link'
import ThemeToggle from './ThemeToggle'
import Sidebar from './Sidebar'
import SearchBar from './SearchBar'
import type { Post } from '@/lib/posts'
import { SITE } from '@/lib/site'

function MenuIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  )
}

export default function AppShell({
  posts,
  children,
}: {
  posts: Post[]
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--bg-card)]/80 backdrop-blur-sm">
        <div className="flex items-center gap-3 px-4 h-14">
          {/* Mobile hamburger */}
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="사이드바 열기"
            className="lg:hidden p-2 -ml-1 rounded-lg text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--bg-subtle)] transition-colors"
          >
            <MenuIcon />
          </button>

          {/* Logo */}
          <Link
            href="/"
            className="text-lg font-bold text-[var(--fg)] hover:text-[var(--accent)] transition-colors"
          >
            {SITE.name}
          </Link>

          <div className="flex-1" />

          {/* Nav + search + theme toggle */}
          <nav className="hidden sm:flex items-center gap-4 text-sm text-[var(--fg-muted)]">
            <Link href="/" className="hover:text-[var(--fg)] transition-colors">홈</Link>
            <a
              href={SITE.author.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[var(--fg)] transition-colors"
            >
              GitHub
            </a>
          </nav>
          <SearchBar
            posts={posts.map((p) => ({
              slug: p.slug,
              title: p.frontmatter.title,
              description: p.frontmatter.description,
              tags: p.frontmatter.tags,
            }))}
          />
          <ThemeToggle />
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1">
        <Sidebar posts={posts} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Mobile overlay backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-20 bg-black/40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <main className="flex-1 min-w-0">{children}</main>
      </div>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] bg-[var(--bg-card)]">
        <div className="mx-auto max-w-5xl px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-[var(--fg-muted)]">
          <p>© {new Date().getFullYear()} {SITE.author.name}. All rights reserved.</p>
          <a
            href={SITE.author.url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[var(--fg)] transition-colors"
          >
            GitHub
          </a>
        </div>
      </footer>
    </div>
  )
}
