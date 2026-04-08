import Link from "next/link";
import { notFound } from "next/navigation";
import { compileMDX } from "next-mdx-remote/rsc";
import rehypeSlug from "rehype-slug";
import rehypePrettyCode from "rehype-pretty-code";
import { visit } from "unist-util-visit";
import { getAllPosts, getPostBySlug } from "@/lib/posts";
import TableOfContents, { type Heading } from "@/components/TableOfContents";
import CodeBlock from "@/components/CodeBlock";

export async function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

const BASE_URL = 'https://jannlee.github.io'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  const { title, description, date } = post.frontmatter;
  const url = `${BASE_URL}/posts/${slug}/`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      type: 'article',
      url,
      publishedTime: date,
      authors: ['Jann Lee'],
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

  const { frontmatter, content } = post;
  const headings: Heading[] = [];

  const { content: mdxContent } = await compileMDX({
    source: content,
    options: {
      mdxOptions: {
        rehypePlugins: [
          rehypeSlug,
          makeRehypeExtractHeadings(headings),
          [rehypePrettyCode, { theme: "github-dark", keepBackground: true }],
        ],
      },
    },
    components: { pre: CodeBlock },
  });

  // JSON.stringify escapes all output; data is trusted MDX frontmatter, not user input.
  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: frontmatter.title,
    description: frontmatter.description,
    author: { "@type": "Person", name: "Jann Lee" },
    datePublished: frontmatter.date,
    url: `${BASE_URL}/posts/${slug}/`,
    keywords: frontmatter.tags.join(", "),
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      {/* Safe JSON-LD: JSON.stringify from trusted frontmatter — no XSS risk */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd }}
      />
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
          <article className="
            text-[var(--fg-secondary)] leading-relaxed
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
        </div>

        {/* ToC sidebar — shown on xl+ screens */}
        {headings.length > 0 && (
          <aside className="hidden xl:block w-52 shrink-0 sticky top-20 self-start max-h-[calc(100vh-6rem)] overflow-y-auto">
            <TableOfContents headings={headings} />
          </aside>
        )}
      </div>
    </div>
  );
}
