import { getAllPosts } from "@/lib/posts";
import PostCard from "@/components/PostCard";

export default function Home() {
  const posts = getAllPosts();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">최근 포스트</h1>
      <p className="text-gray-500 mb-8">개발 경험과 인사이트를 기록합니다.</p>
      {posts.length === 0 ? (
        <p className="text-gray-500">아직 포스트가 없습니다.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
