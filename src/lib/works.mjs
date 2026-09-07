import { getCollection } from 'astro:content';

// 成果物一覧（WORKS）を年代降順に整形して返す。
export async function getWorks() {
  const raw = await getCollection('works');
  return raw
    .sort((a, b) => b.data.year - a.data.year)
    .map((w) => ({
      id: w.id,
      year: w.data.year,
      type: w.data.type,
      title: w.data.title,
      url: w.data.url,
    }));
}

// 実際に使われている種別だけをタブに出す。
export function getTypes(works) {
  return [...new Set(works.map((w) => w.type))];
}
