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
}

export type PostWithContent = Post & {
  content: string
}

const POSTS_DIR = path.join(process.cwd(), 'content/posts')

export function getAllPosts(): Post[] {
  const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith('.mdx'))

  const posts = files.map((file) => {
    const slug = file.replace(/\.mdx$/, '')
    const raw = fs.readFileSync(path.join(POSTS_DIR, file), 'utf-8')
    const { data } = matter(raw)
    return { slug, frontmatter: data as PostFrontmatter }
  })

  return posts
    .filter((post) => !post.frontmatter.draft)
    .sort((a, b) => (a.frontmatter.date < b.frontmatter.date ? 1 : -1))
}

export function getPostBySlug(slug: string): PostWithContent {
  const file = path.join(POSTS_DIR, `${slug}.mdx`)
  const raw = fs.readFileSync(file, 'utf-8')
  const { data, content } = matter(raw)
  return { slug, frontmatter: data as PostFrontmatter, content }
}
