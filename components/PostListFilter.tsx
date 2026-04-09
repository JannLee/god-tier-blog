'use client'

import { Suspense, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import PostCard from './PostCard'
import type { Post } from '@/lib/posts'

type Props = {
  posts: Post[]
  allTags: string[]
}

function FilteredList({ posts, allTags }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeTag = searchParams.get('tag') ?? ''
  const activeCategory = searchParams.get('category') ?? ''

  const filtered = posts
    .filter((p) => !activeCategory || p.frontmatter.category === activeCategory)
    .filter((p) => !activeTag || p.frontmatter.tags.includes(activeTag))

  const setTag = useCallback(
    (tag: string) => {
      const params = new URLSearchParams()
      if (activeCategory) params.set('category', activeCategory)
      if (tag) params.set('tag', tag)
      router.replace(params.size ? `/?${params}` : '/')
    },
    [router, activeCategory]
  )

  return (
    <div>
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setTag('')}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              !activeTag
                ? 'bg-[var(--accent)] text-white'
                : 'bg-[var(--bg-subtle)] text-[var(--fg-muted)] hover:bg-[var(--border)] hover:text-[var(--fg)]'
            }`}
          >
            전체
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setTag(tag)}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                activeTag === tag
                  ? 'bg-[var(--accent)] text-white'
                  : 'bg-[var(--bg-subtle)] text-[var(--fg-muted)] hover:bg-[var(--border)] hover:text-[var(--fg)]'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="text-[var(--fg-muted)]">해당 태그의 포스트가 없습니다.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function PostListFilter(props: Props) {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col gap-4">
          {props.posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      }
    >
      <FilteredList {...props} />
    </Suspense>
  )
}
