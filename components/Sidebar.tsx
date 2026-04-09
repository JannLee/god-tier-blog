'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { Post } from '@/lib/posts'

function XIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`transition-transform ${open ? 'rotate-90' : ''}`}
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}

function FolderIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  )
}

const CATEGORY_LABELS: Record<string, string> = {
  ai: 'AI',
  frontend: 'Frontend',
  frameworks: 'Frameworks',
  languages: 'Languages',
  'devops-infra': 'DevOps / Infra',
  engineering: 'Engineering',
  'dev-log': 'Dev Log',
}

function PostLink({ post, pathname }: { post: Post; pathname: string }) {
  const href = `/posts/${post.slug}/`
  const active = pathname === href || pathname === `/posts/${post.slug}`
  return (
    <li>
      <Link
        href={href}
        className={`block px-2 py-1.5 text-sm rounded-md transition-colors leading-snug ${
          active
            ? 'bg-[var(--accent)]/10 text-[var(--accent)] font-medium'
            : 'text-[var(--fg-secondary)] hover:text-[var(--fg)] hover:bg-[var(--bg-subtle)]'
        }`}
      >
        {post.frontmatter.title}
      </Link>
    </li>
  )
}

function SubGroup({
  label,
  posts,
  pathname,
}: {
  label: string
  posts: Post[]
  pathname: string
}) {
  const [open, setOpen] = useState(true)
  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-1.5 px-2 py-1 text-xs text-[var(--fg-muted)] hover:text-[var(--fg)] transition-colors rounded-md hover:bg-[var(--bg-subtle)]"
      >
        <ChevronIcon open={open} />
        <span>{label}</span>
      </button>
      {open && (
        <ul className="ml-4 mt-0.5 space-y-0.5 border-l border-[var(--border)] pl-2">
          {posts.map((post) => (
            <PostLink key={post.slug} post={post} pathname={pathname} />
          ))}
        </ul>
      )}
    </div>
  )
}

function CategorySection({
  label,
  posts,
  pathname,
  defaultExpanded = true,
}: {
  label: string
  posts: Post[]
  pathname: string
  defaultExpanded?: boolean
}) {
  const [expanded, setExpanded] = useState(defaultExpanded)

  // Group by subcategory when present
  const subGrouped = posts.reduce<Record<string, Post[]>>((acc, post) => {
    const sub = post.frontmatter.subcategory ?? ''
    ;(acc[sub] ??= []).push(post)
    return acc
  }, {})
  const subKeys = Object.keys(subGrouped)
  const hasSubcategories = subKeys.some((k) => k !== '')

  return (
    <div>
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)] hover:text-[var(--fg)] transition-colors rounded-md hover:bg-[var(--bg-subtle)]"
      >
        <ChevronIcon open={expanded} />
        <FolderIcon />
        <span>{label}</span>
        <span className="ml-auto tabular-nums">{posts.length}</span>
      </button>

      {expanded && (
        <div className="mt-1 ml-5 border-l border-[var(--border)] pl-3">
          {hasSubcategories ? (
            <div className="space-y-1">
              {subKeys.filter((k) => k !== '').sort().map((sub) => (
                <SubGroup key={sub} label={sub} posts={subGrouped[sub]} pathname={pathname} />
              ))}
              {subGrouped[''] && (
                <ul className="space-y-0.5">
                  {subGrouped[''].map((post) => (
                    <PostLink key={post.slug} post={post} pathname={pathname} />
                  ))}
                </ul>
              )}
            </div>
          ) : (
            <ul className="space-y-0.5">
              {posts.map((post) => (
                <PostLink key={post.slug} post={post} pathname={pathname} />
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

function PostsSection({ posts, pathname }: { posts: Post[]; pathname: string }) {
  // Group posts by category; uncategorised posts go under a catch-all key.
  const grouped = posts.reduce<Record<string, Post[]>>((acc, post) => {
    const key = post.frontmatter.category ?? '__uncategorised__'
    ;(acc[key] ??= []).push(post)
    return acc
  }, {})

  // Defined categories first (in declaration order), then any extras, then uncategorised.
  const orderedKeys = [
    ...Object.keys(CATEGORY_LABELS).filter((k) => grouped[k]),
    ...Object.keys(grouped).filter(
      (k) => k !== '__uncategorised__' && !CATEGORY_LABELS[k]
    ),
    ...(grouped['__uncategorised__'] ? ['__uncategorised__'] : []),
  ]

  const isSingleGroup = orderedKeys.length === 1

  return (
    <div className="space-y-1">
      {orderedKeys.map((key) => (
        <CategorySection
          key={key}
          label={key === '__uncategorised__' ? 'posts' : (CATEGORY_LABELS[key] ?? key)}
          posts={grouped[key]}
          pathname={pathname}
          defaultExpanded={isSingleGroup}
        />
      ))}
    </div>
  )
}

function SidebarContent({ posts, onClose }: { posts: Post[]; onClose?: () => void }) {
  const pathname = usePathname()

  return (
    <aside className="flex flex-col h-full w-[var(--sidebar-w,256px)] bg-[var(--bg-subtle)] border-r border-[var(--border)] overflow-y-auto">
      {/* Mobile close button */}
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

      <nav className="p-3 space-y-1 flex-1">
        {/* Home link */}
        <Link
          href="/"
          className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-md transition-colors ${
            pathname === '/'
              ? 'bg-[var(--accent)]/10 text-[var(--accent)] font-medium'
              : 'text-[var(--fg-secondary)] hover:text-[var(--fg)] hover:bg-[var(--bg-card)]'
          }`}
        >
          홈
        </Link>

        <div className="pt-2">
          <PostsSection posts={posts} pathname={pathname} />
        </div>
      </nav>
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
      {/* Desktop: always visible */}
      <div className="hidden lg:flex shrink-0">
        <SidebarContent posts={posts} />
      </div>

      {/* Mobile: slide-in overlay */}
      <div
        className={`fixed inset-y-0 left-0 z-30 lg:hidden transform transition-transform duration-200 ease-in-out ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent posts={posts} onClose={onClose} />
      </div>
    </>
  )
}
