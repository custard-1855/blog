import { visit } from 'unist-util-visit';

/**
 * 標準の Markdown 脚注（[^1]）を、本文の横に浮かぶサイドノートに変換する。
 *
 * 記事側は普通の脚注記法のまま書けばよい:
 *
 *   埋め込みモデルは途中で変えられない[^embed]。
 *
 *   [^embed]: 変えたら全件を埋め込み直すことになる。
 *
 * 出力される構造（すべて phrasing content なので <p> の中に置ける）:
 *
 *   <label class="sn-ref" for="sn-1">1</label>
 *   <input type="checkbox" id="sn-1" class="sn-check">
 *   <span class="sidenote"><span class="sn-num">1</span>本文…</span>
 *
 * 広い画面では CSS の float で右の余白へ送り、狭い画面では
 * チェックボックスで開閉する注記になる（JavaScript は使わない）。
 */
export function rehypeSidenotes() {
  return (tree) => {
    const definitions = new Map(); // 脚注 id → 中身（インライン化済み）
    let sectionParent = null;
    let sectionIndex = null;

    // --- 脚注定義を集める ---
    visit(tree, 'element', (node, index, parent) => {
      const classes = node.properties?.className ?? [];
      const isFootnoteSection =
        node.tagName === 'section' &&
        Array.isArray(classes) &&
        classes.includes('footnotes');
      if (!isFootnoteSection) return;

      sectionParent = parent;
      sectionIndex = index;

      visit(node, 'element', (li) => {
        if (li.tagName !== 'li' || !li.properties?.id) return;
        definitions.set(li.properties.id, inlineContent(li));
      });
    });

    if (definitions.size === 0) return;

    // --- 記事末の脚注セクションは不要なので落とす ---
    if (sectionParent && sectionIndex !== null) {
      sectionParent.children.splice(sectionIndex, 1);
    }

    // --- 参照箇所をサイドノートに差し替える ---
    let counter = 0;
    visit(tree, 'element', (node, index, parent) => {
      if (node.tagName !== 'sup' || !parent || index === null) return;

      const anchor = node.children.find(
        (child) =>
          child.type === 'element' &&
          child.tagName === 'a' &&
          child.properties?.['dataFootnoteRef'] !== undefined
      );
      if (!anchor) return;

      const targetId = String(anchor.properties.href ?? '').slice(1);
      const content = definitions.get(targetId);
      if (!content) return;

      counter += 1;
      const toggleId = `sn-${counter}`;

      // input を label より前に置くのは、CSS の兄弟セレクタで
      // 「チェックボックスにフォーカスが当たったら番号を光らせる」を
      // 書けるようにするため（後方の要素は選択できないため順序が効く）。
      parent.children.splice(index, 1, {
        type: 'element',
        tagName: 'input',
        properties: { type: 'checkbox', id: toggleId, className: ['sn-check'] },
        children: [],
      }, {
        type: 'element',
        tagName: 'label',
        properties: {
          className: ['sn-ref'],
          htmlFor: toggleId,
          role: 'doc-noteref',
        },
        children: [{ type: 'text', value: String(counter) }],
      }, {
        type: 'element',
        tagName: 'span',
        properties: { className: ['sidenote'] },
        children: [
          {
            type: 'element',
            tagName: 'span',
            properties: { className: ['sn-num'], 'aria-hidden': 'true' },
            children: [{ type: 'text', value: String(counter) }],
          },
          ...content,
        ],
      });
    });
  };
}

/**
 * <li> の中身を phrasing content に均す。
 * 段落は中身だけ取り出し、複数段落は区切り用の span を挟む。
 * 「本文へ戻る」リンクはサイドノートでは意味を持たないので捨てる。
 */
function inlineContent(li) {
  const out = [];

  for (const child of li.children) {
    if (child.type === 'element' && child.tagName === 'p') {
      if (out.length > 0) {
        out.push({
          type: 'element',
          tagName: 'span',
          properties: { className: ['sn-break'] },
          children: [],
        });
      }
      out.push(...child.children.filter(notBackref));
    } else if (child.type === 'text' && child.value.trim() === '') {
      // 整形用の空白は落とす
    } else if (notBackref(child)) {
      out.push(child);
    }
  }

  return out;
}

function notBackref(node) {
  return !(
    node.type === 'element' &&
    node.tagName === 'a' &&
    node.properties?.['dataFootnoteBackref'] !== undefined
  );
}
