import GithubSlugger from 'github-slugger';
import { visit } from 'unist-util-visit';

import { createNumberer, splitLabel } from '../lib/numbering.mjs';

/**
 * 見出しに章・節番号を振り、あわせて目次のデータを組み立てる。
 *
 *   ## 文章の基本
 *
 * を、こう変換する:
 *
 *   <h2 id="文章の基本"><span class="n">1</span>文章の基本</h2>
 *
 * さらに、番号と見出しを分けた形の目次を
 * file.data.astro.frontmatter.toc に書き出す。レイアウトは
 * render() が返す remarkPluginFrontmatter からこれを受け取る。
 *
 * なぜ rehype ではなく remark なのか:
 *   1. frontmatter への追記が remarkPluginFrontmatter に伝わるのは
 *      remark 段階だけ。rehype で書き換えても届かない。
 *   2. Astro が headings を抜くのは rehype のあとなので、そこでは
 *      headings[].text に番号が混ざる（「1文章の基本」）。目次で番号を
 *      別に飾りたいので、番号を入れる前のこの段階で控えておく必要がある。
 *
 * id は見出し本体（番号を除いた文字列）から作り、hProperties で直接
 * 指定する。rehype-slug は id が無い見出しにしか触らないので、
 * 番号入りの見出しから作り直されることはない。
 *
 * 見出しに「|」を書くと、その左側が番号の代わりのラベルになり、
 * 採番は進まない（「補遺」「はじめに」などに使う）。
 * front matter に numbering: false を書くと、その記事だけ採番しない。
 */
export function remarkHeadingNumbers() {
  return (tree, file) => {
    const frontmatter = file?.data?.astro?.frontmatter;
    const next = createNumberer(frontmatter?.numbering !== false);
    const slugger = new GithubSlugger();
    const toc = [];

    visit(tree, 'heading', (node) => {
      const depth = node.depth;
      if (depth < 2 || depth > 4) return;

      // 見出しの先頭が文字列でなければ（画像やコードで始まる等）触らない
      const first = node.children[0];
      const raw = first && first.type === 'text' ? first.value : '';
      const { explicit, text } = splitLabel(raw);

      // 「|」が書かれていた場合は、ラベル部分を見出し本体から取り除く
      if (explicit !== null && first) first.value = text;

      const label = next(depth, explicit);
      const title = toText(node);
      const id = slugger.slug(title);

      node.data ??= {};
      node.data.hProperties = { ...(node.data.hProperties ?? {}), id };

      toc.push({ depth, id, label, text: title });

      if (!label) return;

      node.children.unshift({
        type: 'html',
        value: `<span class="n">${escapeHtml(label)}</span>`,
      });
    });

    if (frontmatter) frontmatter.toc = toc;
  };
}

/** 見出しの中の文字だけを取り出す（`コード` などが混ざっていてもよい）。 */
function toText(node) {
  let out = '';
  visit(node, (n) => {
    if (n.type === 'text' || n.type === 'inlineCode') out += n.value;
  });
  return out.trim();
}

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
