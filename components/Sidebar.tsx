'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import type { Post } from '@/lib/posts'
import { SITE } from '@/lib/site'

const CATEGORY_LABELS: Record<string, string> = {
  ai: 'AI',
  frontend: 'Frontend',
  frameworks: 'Frameworks',
  languages: 'Languages',
  'devops-infra': 'DevOps / Infra',
  engineering: 'Engineering',
  'dev-log': 'Dev Log',
}

function XIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function GitHubIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
    </svg>
  )
}

function ProfileSection() {
  const initials = SITE.author.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()

  return (
    <div className="px-4 py-4 border-b border-[var(--border)]">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-9 h-9 rounded-full bg-[var(--accent)] flex items-center justify-center text-white text-sm font-semibold shrink-0">
          {initials}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[var(--fg)] truncate">{SITE.author.name}</p>
          <a
            href={SITE.author.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-[var(--fg-muted)] hover:text-[var(--fg)] transition-colors"
          >
            <GitHubIcon />
            GitHub
          </a>
        </div>
      </div>
      <p className="text-xs text-[var(--fg-muted)] leading-relaxed">{SITE.description}</p>
    </div>
  )
}

function CategoryNav({ posts }: { posts: Post[] }) {
  const searchParams = useSearchParams()
  const activeCategory = searchParams.get('category') ?? ''

  const counts: Record<string, number> = {}
  for (const post of posts) {
    const key = post.frontmatter.category ?? '__uncategorised__'
    counts[key] = (counts[key] ?? 0) + 1
  }

  const orderedKeys = [
    ...Object.keys(CATEGORY_LABELS).filter((k) => counts[k]),
    ...Object.keys(counts).filter((k) => k !== '__uncategorised__' && !CATEGORY_LABELS[k]),
    ...(counts['__uncategorised__'] ? ['__uncategorised__'] : []),
  ]

  return (
    <nav className="p-3 space-y-0.5">
      <Link
        href="/"
        className={`flex items-center justify-between px-3 py-1.5 rounded-md text-sm transition-colors ${
          !activeCategory
            ? 'bg-[var(--accent)]/10 text-[var(--accent)] font-medium'
            : 'text-[var(--fg-secondary)] hover:text-[var(--fg)] hover:bg-[var(--bg-card)]'
        }`}
      >
        <span>전체</span>
        <span className="text-xs tabular-nums text-[var(--fg-muted)]">{posts.length}</span>
      </Link>

      {orderedKeys.map((key) => {
        const label = key === '__uncategorised__' ? 'Posts' : (CATEGORY_LABELS[key] ?? key)
        const href = key === '__uncategorised__' ? '/' : `/?category=${encodeURIComponent(key)}`
        const isActive = activeCategory === key

        return (
          <Link
            key={key}
            href={href}
            className={`flex items-center justify-between px-3 py-1.5 rounded-md text-sm transition-colors ${
              isActive
                ? 'bg-[var(--accent)]/10 text-[var(--accent)] font-medium'
                : 'text-[var(--fg-secondary)] hover:text-[var(--fg)] hover:bg-[var(--bg-card)]'
            }`}
          >
            <span>{label}</span>
            <span
              className={`text-xs tabular-nums px-1.5 py-0.5 rounded-full ${
                isActive
                  ? 'bg-[var(--accent)]/20 text-[var(--accent)]'
                  : 'bg-[var(--bg-card)] text-[var(--fg-muted)]'
              }`}
            >
              {counts[key]}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}

function SidebarContent({ posts, onClose }: { posts: Post[]; onClose?: () => void }) {
  return (
    <aside className="flex flex-col w-[var(--sidebar-w,256px)] bg-[var(--bg-subtle)] border-r border-[var(--border)]">
      {onClose && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] lg:hidden">
          <span className="text-sm font-semibold text-[var(--fg)]">탐색</span>
          <button
            onClick={onClose}
            aria-label="닫기"
            className="p-1.5 rounded-md text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--bg-card)] transition-colors"
          >
            <XIcon />
          </button>
        </div>
      )}

      <ProfileSection />

      <Suspense fallback={<div className="p-3 text-xs text-[var(--fg-muted)]">로딩 중…</div>}>
        <CategoryNav posts={posts} />
      </Suspense>
    </aside>
  )
}

export default function Sidebar({
  posts,
  open,
  onClose,
}: {
  posts: Post[]
  open: boolean
  onClose: () => void
}) {
  return (
    <>
      {/* Desktop: always visible, sticky */}
      <div className="hidden lg:block shrink-0 sticky top-14 self-start h-[calc(100vh-3.5rem)] overflow-y-auto">
        <SidebarContent posts={posts} />
      </div>

      {/* Mobile: slide-in overlay */}
      <div
        className={`fixed inset-y-0 left-0 z-30 lg:hidden transform transition-transform duration-200 ease-in-out overflow-y-auto ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent posts={posts} onClose={onClose} />
      </div>
    </>
  )
}
