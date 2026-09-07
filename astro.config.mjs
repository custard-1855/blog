import { defineConfig } from 'astro/config';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeSlug from 'rehype-slug';

import { rehypeEquations } from './src/plugins/rehype-equations.mjs';
import { rehypeSidenotes } from './src/plugins/rehype-sidenotes.mjs';
import { remarkHeadingNumbers } from './src/plugins/remark-heading-numbers.mjs';

// ┌──────────────────────────────────────────────────────────┐
// │ ここを自分のリポジトリに合わせて書き換える                │
// │                                                          │
// │ 1. <USERNAME>.github.io というリポジトリに置く場合:       │
// │      site: 'https://<USERNAME>.github.io'                 │
// │      base: 未指定（削除する）                             │
// │                                                          │
// │ 2. <USERNAME>.github.io/<REPO> に置く場合:                │
// │      site: 'https://<USERNAME>.github.io'                 │
// │      base: '/<REPO>'                                      │
// └──────────────────────────────────────────────────────────┘
export default defineConfig({
  site: 'https://custard-1855.github.io',
  base: '/blog',

  markdown: {
    remarkPlugins: [
      remarkHeadingNumbers, // 章・節番号を振り、目次データを frontmatter に書き出す
      remarkMath,
    ],
    rehypePlugins: [
      rehypeSlug,          // id の無い見出しに id を振る（章節見出しは remark 側で付与済み）
      rehypeSidenotes,     // 脚注をサイドノートへ
      rehypeEquations,     // 数式を採番（KaTeX より前に走らせる）
      rehypeKatex,         // ビルド時に数式を描画。実行時の JS はゼロ
    ],
    syntaxHighlight: 'shiki',
    shikiConfig: {
      // 記事の配色に寄せた暗色テーマ
      theme: 'github-dark-default',
      wrap: false,
    },
  },
});
