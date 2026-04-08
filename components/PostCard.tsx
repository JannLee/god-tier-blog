import Link from "next/link";
import type { Post } from "@/lib/posts";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function PostCard({ post }: { post: Post }) {
  const { slug, frontmatter } = post;
  return (
    <article className="border border-[var(--border)] rounded-xl p-6 bg-[var(--bg-card)] hover:border-[var(--accent)]/50 hover:shadow-sm transition-all">
      <Link href={`/posts/${slug}/`} className="group">
        <h2 className="text-xl font-semibold text-[var(--fg)] group-hover:text-[var(--accent)] transition-colors mb-1 leading-snug">
          {frontmatter.title}
        </h2>
      </Link>
      <time className="text-sm text-[var(--fg-muted)]" dateTime={frontmatter.date}>
        {formatDate(frontmatter.date)}
      </time>
      <p className="mt-3 text-[var(--fg-secondary)] text-sm leading-relaxed">
        {frontmatter.description}
      </p>
      {frontmatter.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {frontmatter.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 bg-[var(--bg-subtle)] text-[var(--fg-muted)] text-xs rounded-full border border-[var(--border)]"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      <Link
        href={`/posts/${slug}/`}
        className="mt-4 inline-block text-sm text-[var(--accent)] hover:text-[var(--accent-hover)] font-medium transition-colors"
      >
        읽기 →
      </Link>
    </article>
  );
}
