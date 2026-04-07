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
    <article className="border border-gray-200 rounded-lg p-6 hover:border-gray-400 transition-colors">
      <Link href={`/posts/${slug}/`} className="group">
        <h2 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
          {frontmatter.title}
        </h2>
      </Link>
      <time className="text-sm text-gray-500" dateTime={frontmatter.date}>
        {formatDate(frontmatter.date)}
      </time>
      <p className="mt-3 text-gray-600 text-sm leading-relaxed">
        {frontmatter.description}
      </p>
      {frontmatter.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {frontmatter.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      <Link
        href={`/posts/${slug}/`}
        className="mt-4 inline-block text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
      >
        읽기 →
      </Link>
    </article>
  );
}
