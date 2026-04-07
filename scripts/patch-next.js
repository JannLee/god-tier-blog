#!/usr/bin/env node
// Applies compatibility patches to next@15.2.x for App Router + output:"export" mode.
// Issue: Next.js 15 maps /404 and /500 to /_error (Pages Router) even in App Router
//        projects. /_error imports <Html> from next/document which throws in App Router.
// Fix:  Skip /_error generation when App Router's /_not-found is present (hasApp404).

const fs = require("fs");
const path = require("path");

const files = [
  path.join(__dirname, "../node_modules/next/dist/build/index.js"),
  path.join(__dirname, "../node_modules/next/dist/esm/build/index.js"),
];

const ORIGINAL_404_MAP = `if (useStaticPages404) {
                                defaultMap['/404'] = {
                                    page: hasPages404 ? '/404' : '/_error'
                                };
                            }
                            if (useDefaultStatic500) {
                                defaultMap['/500'] = {
                                    page: '/_error'
                                };
                            }`;

const PATCHED_404_MAP = `if (useStaticPages404) {
                                // Patch: In App Router mode, /_error imports <Html> from next/document
                                // which throws. Skip when hasApp404 (not-found.tsx exists).
                                if (!hasApp404) {
                                    defaultMap['/404'] = {
                                        page: hasPages404 ? '/404' : '/_error'
                                    };
                                }
                            }
                            if (useDefaultStatic500) {
                                // Patch: Skip /_error for /500 in App Router mode.
                                if (!hasApp404) {
                                    defaultMap['/500'] = {
                                        page: '/_error'
                                    };
                                }
                            }`;

const ORIGINAL_500_MOVE = `if (useDefaultStatic500) {
                        await moveExportedPage('/_error', '/500', '/500', false, 'html');
                    }`;

const PATCHED_500_MOVE = `if (useDefaultStatic500 && !hasApp404) {
                        await moveExportedPage('/_error', '/500', '/500', false, 'html');
                    }`;

let patchedCount = 0;

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, "utf8");
  let changed = false;

  if (content.includes(ORIGINAL_404_MAP)) {
    content = content.replace(ORIGINAL_404_MAP, PATCHED_404_MAP);
    changed = true;
  }
  if (content.includes(ORIGINAL_500_MOVE)) {
    content = content.replace(ORIGINAL_500_MOVE, PATCHED_500_MOVE);
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, content, "utf8");
    console.log(`[patch-next] Patched: ${path.relative(process.cwd(), file)}`);
    patchedCount++;
  } else {
    console.log(`[patch-next] Already patched or not found: ${path.relative(process.cwd(), file)}`);
  }
}

console.log(`[patch-next] Done. ${patchedCount} file(s) patched.`);
