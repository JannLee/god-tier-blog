'use client'

import { useEffect, useRef, useState } from 'react'
import Fuse from 'fuse.js'
import Link from 'next/link'

type PostSearchItem = {
  slug: string
  title: string
  description: string
  tags: string[]
}

export default function SearchBar({ posts }: { posts: PostSearchItem[] }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const fuse = useRef(
    new Fuse(posts, {
      keys: [
        { name: 'title', weight: 3 },
        { name: 'description', weight: 2 },
        { name: 'tags', weight: 1 },
      ],
      threshold: 0.4,
    })
  )

  const results = query.trim() ? fuse.current.search(query).slice(0, 8) : []

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => {
    if (open) {
      setQuery('')
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 text-sm text-[var(--fg-muted)] hover:text-[var(--fg)] transition-colors border border-[var(--border)] rounded-lg px-3 py-1.5 hover:border-[var(--accent)]/50 bg-[var(--bg-subtle)]"
        aria-label="검색"
      >
        <SearchIcon />
        <span className="hidden sm:inline">검색</span>
        <kbd className="hidden sm:inline text-xs bg-[var(--bg-card)] border border-[var(--border)] rounded px-1 py-0.5 font-mono text-[var(--fg-muted)]">
          ⌘K
        </kbd>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="relative w-full max-w-xl bg-[var(--bg-card)] rounded-xl shadow-2xl border border-[var(--border)] overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border)]">
              <SearchIcon className="text-[var(--fg-muted)] shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="포스트 검색..."
                className="flex-1 text-sm outline-none text-[var(--fg)] bg-transparent placeholder-[var(--fg-muted)]"
              />
              <kbd className="text-xs text-[var(--fg-muted)] border border-[var(--border)] rounded px-1.5 py-0.5 font-mono">
                ESC
              </kbd>
            </div>

            {query.trim() === '' ? (
              <div className="px-4 py-8 text-center text-sm text-[var(--fg-muted)]">
                검색어를 입력하세요
              </div>
            ) : results.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-[var(--fg-muted)]">
                &ldquo;{query}&rdquo; 검색 결과 없음
              </div>
            ) : (
              <ul className="py-2 max-h-80 overflow-y-auto">
                {results.map(({ item }) => (
                  <li key={item.slug}>
                    <Link
                      href={`/posts/${item.slug}/`}
                      onClick={() => setOpen(false)}
                      className="flex flex-col gap-0.5 px-4 py-3 hover:bg-[var(--bg-subtle)] transition-colors"
                    >
                      <span className="text-sm font-medium text-[var(--fg)]">
                        {item.title}
                      </span>
                      <span className="text-xs text-[var(--fg-muted)] line-clamp-1">
                        {item.description}
                      </span>
                      {item.tags.length > 0 && (
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {item.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-xs bg-[var(--bg-subtle)] text-[var(--fg-muted)] px-1.5 py-0.5 rounded-full border border-[var(--border)]"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </>
  )
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      width="14"
      height="14"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      className={className}
    >
      <circle cx="11" cy="11" r="8" />
      <path strokeLinecap="round" d="M21 21l-4.35-4.35" />
    </svg>
  )
}
