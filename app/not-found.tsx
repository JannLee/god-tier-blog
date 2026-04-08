import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 text-center">
      <h2 className="text-2xl font-bold text-[var(--fg)] mb-4">
        페이지를 찾을 수 없습니다
      </h2>
      <p className="text-[var(--fg-muted)] mb-8">
        요청한 페이지가 존재하지 않습니다.
      </p>
      <Link href="/" className="text-[var(--accent)] hover:text-[var(--accent-hover)] font-medium">
        홈으로 돌아가기 →
      </Link>
    </div>
  );
}
