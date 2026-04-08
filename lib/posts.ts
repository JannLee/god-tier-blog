import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

export type PostFrontmatter = {
  title: string
  date: string // ISO format: "2026-04-07"
  description: string
  category?: string    // e.g. "frontend" | "languages" | "devops-infra" | "engineering" | "dev-log"
  subcategory?: string // e.g. "typescript" | "deployment" | "retrospective"
  tags: string[]
  draft?: boolean
}

export type Post = {
  slug: string
  frontmatter: PostFrontmatter
  readingTimeMin: number
}

export type PostWithContent = Post & {
  content: string
}

const POSTS_DIR = path.join(process.cwd(), 'content/posts')

export function getReadingTime(content: string): number {
  const stripped = content
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]*`/g, '')
    .replace(/[#*_\[\]()>~]/g, '')
    .trim()
  // Korean ~500 chars/min mixed with code/English; conservative estimate
  const chars = stripped.replace(/\s+/g, '').length
  return Math.max(1, Math.ceil(chars / 500))
}

export function getAllPosts(): Post[] {
  const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith('.mdx'))

  const posts = files.map((file) => {
    const slug = file.replace(/\.mdx$/, '')
    const raw = fs.readFileSync(path.join(POSTS_DIR, file), 'utf-8')
    const { data, content } = matter(raw)
    return { slug, frontmatter: data as PostFrontmatter, readingTimeMin: getReadingTime(content) }
  })

  return posts
    .filter((post) => !post.frontmatter.draft)
    .sort((a, b) => (a.frontmatter.date < b.frontmatter.date ? 1 : -1))
}

export function getPostBySlug(slug: string): PostWithContent {
  const file = path.join(POSTS_DIR, `${slug}.mdx`)
  const raw = fs.readFileSync(file, 'utf-8')
  const { data, content } = matter(raw)
  return { slug, frontmatter: data as PostFrontmatter, content, readingTimeMin: getReadingTime(content) }
}

export function getAdjacentPosts(slug: string): { prev: Post | null; next: Post | null } {
  const posts = getAllPosts()
  const idx = posts.findIndex((p) => p.slug === slug)
  if (idx === -1) return { prev: null, next: null }
  // posts is sorted newest-first: older post = higher index (prev), newer = lower index (next)
  return {
    prev: idx < posts.length - 1 ? posts[idx + 1] : null,
    next: idx > 0 ? posts[idx - 1] : null,
  }
}

export function getRelatedPosts(slug: string, tags: string[], limit = 3): Post[] {
  return getAllPosts()
    .filter((p) => p.slug !== slug && p.frontmatter.tags.some((t) => tags.includes(t)))
    .slice(0, limit)
}
