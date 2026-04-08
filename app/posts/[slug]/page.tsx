import Link from "next/link";
import { notFound } from "next/navigation";
import { compileMDX } from "next-mdx-remote/rsc";
import rehypeSlug from "rehype-slug";
import rehypePrettyCode from "rehype-pretty-code";
import { visit } from "unist-util-visit";
import { getAllPosts, getPostBySlug, getAdjacentPosts, getRelatedPosts } from "@/lib/posts";
import TableOfContents, { type Heading } from "@/components/TableOfContents";
import CodeBlock from "@/components/CodeBlock";
import PostCard from "@/components/PostCard";
import ScrollProgress from "@/components/ScrollProgress";
import BackToTop from "@/components/BackToTop";
import { SITE } from "@/lib/site";

export async function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  const { title, description, date, tags } = post.frontmatter;
  const url = `${SITE.url}/posts/${slug}/`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      type: 'article',
      url,
      locale: SITE.locale,
      siteName: SITE.name,
      publishedTime: date,
      authors: [SITE.author.name],
      tags,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Runs after rehype-slug so IDs are already set on headings.
function makeRehypeExtractHeadings(headings: Heading[]) {
  type HastNode = {
    type: string;
    tagName?: string;
    properties?: Record<string, unknown>;
    children?: HastNode[];
    value?: string;
  };
  return () => (tree: HastNode) => {
    visit(
      tree as Parameters<typeof visit>[0],
      "element",
      (node: HastNode) => {
        if (node.tagName !== "h2" && node.tagName !== "h3") return;
        const id = node.properties?.id as string | undefined;
        const text = (node.children ?? [])
          .filter((c) => c.type === "text")
          .map((c) => c.value ?? "")
          .join("");
        if (id && text) {
          headings.push({
            id,
            text,
            level: Number(node.tagName[1]) as 2 | 3,
          });
        }
      }
    );
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) notFound();

  const { frontmatter, content, readingTimeMin } = post;
  const headings: Heading[] = [];

  const { content: mdxContent } = await compileMDX({
    source: content,
    options: {
      mdxOptions: {
        rehypePlugins: [
          rehypeSlug,
          makeRehypeExtractHeadings(headings),
          // P0: dual theme — github-light in light mode, github-dark in dark mode
          [rehypePrettyCode, { theme: { light: "github-light", dark: "github-dark" }, keepBackground: true }],
        ],
      },
    },
    components: { pre: CodeBlock },
  });

  const adjacentPosts = getAdjacentPosts(slug);
  const relatedPosts = getRelatedPosts(slug, frontmatter.tags);

  // All values from trusted MDX frontmatter + compile-time SITE constant.
  // JSON.stringify escapes all special characters — XSS is not possible here.
  const postUrl = `${SITE.url}/posts/${slug}/`;
  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    mainEntityOfPage: { "@type": "WebPage", "@id": postUrl },
    headline: frontmatter.title,
    description: frontmatter.description,
    datePublished: frontmatter.date,
    dateModified: frontmatter.date,
    inLanguage: "ko",
    url: postUrl,
    keywords: frontmatter.tags.join(", "),
    author: {
      "@type": "Person",
      name: SITE.author.name,
      url: SITE.author.url,
    },
    publisher: {
      "@type": "Person",
      name: SITE.author.name,
      url: SITE.author.url,
    },
    isPartOf: {
      "@type": "WebSite",
      name: SITE.name,
      url: SITE.url,
    },
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      {/* Safe JSON-LD: JSON.stringify from trusted frontmatter — no XSS risk */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd }}
      />

      {/* P2: scroll progress bar & back-to-top */}
      <ScrollProgress />
      <BackToTop />

      {/* P1: breadcrumb */}
      <nav aria-label="breadcrumb" className="flex items-center gap-1.5 text-sm text-[var(--fg-muted)] mb-3">
        <Link href="/" className="hover:text-[var(--accent)] transition-colors">홈</Link>
        {frontmatter.category && (
          <>
            <span aria-hidden="true">/</span>
            <span className="capitalize">{frontmatter.category}</span>
          </>
        )}
        <span aria-hidden="true">/</span>
        <span className="text-[var(--fg)] truncate max-w-[240px]">{frontmatter.title}</span>
      </nav>

      <Link
        href="/"
        className="text-sm text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors mb-8 inline-block"
      >
        ← 목록으로
      </Link>

      <div className="flex gap-12 items-start">
        {/* Main article */}
        <div className="flex-1 min-w-0">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-[var(--fg)] mb-3 leading-tight">
              {frontmatter.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3">
              <time className="text-sm text-[var(--fg-muted)]" dateTime={frontmatter.date}>
                {formatDate(frontmatter.date)}
              </time>
              {/* P1: reading time */}
              <span className="text-[var(--fg-muted)] text-sm" aria-hidden="true">·</span>
              <span className="text-sm text-[var(--fg-muted)]">읽기 {readingTimeMin}분</span>
              {frontmatter.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
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
            </div>
          </header>

          {/* Prose content — dark-mode aware via CSS variables */}
          {/* P0: text-base (16px) — was 14px default */}
          <article className="
            text-base text-[var(--fg-secondary)] leading-relaxed
            [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-[var(--fg)] [&_h1]:mt-8 [&_h1]:mb-4
            [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-[var(--fg)] [&_h2]:mt-8 [&_h2]:mb-3
            [&_h3]:text-lg [&_h3]:font-medium [&_h3]:text-[var(--fg)] [&_h3]:mt-5 [&_h3]:mb-2
            [&_p]:mb-4 [&_p]:leading-7
            [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4
            [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4
            [&_li]:mb-1
            [&_a]:text-[var(--accent)] [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-[var(--accent-hover)]
            [&_code:not(pre_code)]:bg-[var(--bg-subtle)] [&_code:not(pre_code)]:px-1.5 [&_code:not(pre_code)]:py-0.5 [&_code:not(pre_code)]:rounded [&_code:not(pre_code)]:text-sm [&_code:not(pre_code)]:font-mono [&_code:not(pre_code)]:text-[var(--fg)]
            [&_blockquote]:border-l-4 [&_blockquote]:border-[var(--accent)]/40 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-[var(--fg-muted)] [&_blockquote]:mb-4
            [&_strong]:font-semibold [&_strong]:text-[var(--fg)]
            [&_hr]:border-[var(--border)] [&_hr]:my-6
            [&_table]:w-full [&_table]:border-collapse [&_table]:mb-4
            [&_th]:text-left [&_th]:px-3 [&_th]:py-2 [&_th]:border [&_th]:border-[var(--border)] [&_th]:bg-[var(--bg-subtle)] [&_th]:font-semibold [&_th]:text-sm
            [&_td]:px-3 [&_td]:py-2 [&_td]:border [&_td]:border-[var(--border)] [&_td]:text-sm
            [&_figure]:my-0
          ">
            {mdxContent}
          </article>

          {/* P1: prev/next navigation */}
          <nav aria-label="포스트 탐색" className="mt-12 pt-6 border-t border-[var(--border)] flex justify-between gap-6">
            {adjacentPosts.prev ? (
              <Link href={`/posts/${adjacentPosts.prev.slug}/`} className="flex-1 group min-w-0">
                <p className="text-xs text-[var(--fg-muted)] mb-1">← 이전 포스트</p>
                <p className="text-sm font-medium text-[var(--fg)] group-hover:text-[var(--accent)] transition-colors line-clamp-2">
                  {adjacentPosts.prev.frontmatter.title}
                </p>
              </Link>
            ) : (
              <div className="flex-1" />
            )}
            {adjacentPosts.next && (
              <Link href={`/posts/${adjacentPosts.next.slug}/`} className="flex-1 text-right group min-w-0">
                <p className="text-xs text-[var(--fg-muted)] mb-1">다음 포스트 →</p>
                <p className="text-sm font-medium text-[var(--fg)] group-hover:text-[var(--accent)] transition-colors line-clamp-2">
                  {adjacentPosts.next.frontmatter.title}
                </p>
              </Link>
            )}
          </nav>

          {/* P2: related posts */}
          {relatedPosts.length > 0 && (
            <section className="mt-12" aria-label="관련 포스트">
              <h2 className="text-base font-semibold text-[var(--fg)] mb-4">관련 포스트</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {relatedPosts.map((p) => (
                  <PostCard key={p.slug} post={p} />
                ))}
              </div>
            </section>
          )}
        </div>

        {/* P0: ToC sidebar — lg+ (was xl+) */}
        {headings.length > 0 && (
          <aside className="hidden lg:block w-52 shrink-0 sticky top-20 self-start max-h-[calc(100vh-6rem)] overflow-y-auto">
            <TableOfContents headings={headings} />
          </aside>
        )}
      </div>
    </div>
  );
}
