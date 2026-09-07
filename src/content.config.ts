import { defineCollection, z } from 'astro:content';
import { glob, file } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    // 表題の上に出る小さなラベルにも、WRITING 一覧のジャンルタブにも使う分類。
    // 増やす場合はここに追加する
    genre: z.enum(['技術', '学び', '思考']),
    // リード文。一覧ページの説明文にも使う
    standfirst: z.string(),
    date: z.coerce.date(),
    draft: z.boolean().default(false),
    // false にすると、その記事だけ章・節の採番をしない
    numbering: z.boolean().default(true),
    // 「前提 / 依存 / 所要」のようなメタ情報。好きな項目を並べてよい
    facts: z
      .array(z.object({ label: z.string(), value: z.string() }))
      .default([]),
  }),
});

// 成果物一覧（WORKS）。個別ページは持たず、外部リンクへの表として出すだけなので、
// 記事のような Markdown ファイル群ではなく単一の JSON をロードする。
const works = defineCollection({
  loader: file('src/content/works.json'),
  schema: z.object({
    id: z.string(),
    year: z.number().int(),
    // 表の種別タグ。フィルタのラベルにもそのまま使う
    type: z.string(),
    title: z.string(),
    url: z.string().url(),
  }),
});

export const collections = { posts, works };
