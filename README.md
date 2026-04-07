# Blog

Next.js 15 기반 정적 블로그 (GitHub Pages 배포)

## 로컬 개발

```bash
# 의존성 설치
pnpm install

# 개발 서버 실행 (http://localhost:3000)
pnpm dev

# 정적 빌드 (out/ 디렉토리 생성)
pnpm build

# 빌드 결과물 로컬 확인
npx serve out
```

## 배포

`main` 브랜치에 push하면 GitHub Actions가 자동으로 빌드하고 GitHub Pages에 배포합니다.

```
main 브랜치 push
  → GitHub Actions (.github/workflows/deploy.yml)
  → pnpm build (out/ 디렉토리 생성)
  → gh-pages 브랜치에 배포
  → GitHub Pages 서빙
```

수동 배포가 필요한 경우 GitHub Actions 탭에서 "Deploy to GitHub Pages" 워크플로우를 직접 실행할 수 있습니다 (`workflow_dispatch`).

## 기술 스택

- **프레임워크**: Next.js 15 (App Router, Static Export)
- **언어**: TypeScript
- **스타일**: Tailwind CSS v4
- **배포**: GitHub Actions → GitHub Pages
- **패키지 매니저**: pnpm
