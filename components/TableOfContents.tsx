'use client'

import { useEffect, useRef, useState } from 'react'

export type Heading = {
  id: string
  text: string
  level: 2 | 3
}

export default function TableOfContents({ headings }: { headings: Heading[] }) {
  const [activeId, setActiveId] = useState<string>('')
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    if (headings.length === 0) return

    const headingEls = headings
      .map(({ id }) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[]

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible.length > 0) setActiveId(visible[0].target.id)
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0 }
    )

    headingEls.forEach((el) => observerRef.current?.observe(el))
    return () => observerRef.current?.disconnect()
  }, [headings])

  if (headings.length === 0) return null

  return (
    <nav aria-label="목차" className="text-sm">
      <p className="font-semibold text-[var(--fg-muted)] mb-3 text-xs uppercase tracking-wider">
        목차
      </p>
      <ul className="space-y-1.5">
        {headings.map((h) => (
          <li key={h.id} className={h.level === 3 ? 'pl-3' : ''}>
            <a
              href={`#${h.id}`}
              onClick={(e) => {
                e.preventDefault()
                document.getElementById(h.id)?.scrollIntoView({
                  behavior: 'smooth',
                  block: 'start',
                })
                setActiveId(h.id)
              }}
              className={`block leading-snug transition-colors hover:text-[var(--accent)] ${
                activeId === h.id
                  ? 'text-[var(--accent)] font-medium'
                  : 'text-[var(--fg-muted)]'
              }`}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
