import { getCollection } from 'astro:content';

const fmt = new Intl.DateTimeFormat('ja-JP', { dateStyle: 'long' });

// 公開済みの記事を新しい順に整形して返す。
// TOP（最新数件）と WRITING 一覧（全件＋ジャンルタブ）の両方から使う。
export async function getPublishedPosts() {
  const base = import.meta.env.BASE_URL;
  const raw = await getCollection('posts', ({ data }) => !data.draft);

  return raw
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
    .map((p) => ({
      id: p.id,
      title: p.data.title,
      genre: p.data.genre,
      standfirst: p.data.standfirst,
      dateLabel: fmt.format(p.data.date),
      href: [base, 'posts', p.id, ''].join('/').replace(/\/{2,}/g, '/'),
    }));
}

// 実際に使われているジャンルだけをタブに出す。
// 新しいジャンルを追加しても、ここを直す必要はない。
export function getGenres(posts) {
  return [...new Set(posts.map((p) => p.genre))];
}
