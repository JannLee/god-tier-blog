"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ko">
      <body
        style={{
          display: "flex",
          minHeight: "100vh",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
          margin: 0,
        }}
      >
        <div style={{ textAlign: "center" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1rem" }}>
            오류가 발생했습니다
          </h2>
          <button
            onClick={reset}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: "0.25rem",
              cursor: "pointer",
            }}
          >
            다시 시도
          </button>
        </div>
      </body>
    </html>
  );
}
