import { visit } from 'unist-util-visit';

/**
 * 表示数式（$$...$$）を採番し、本文から参照できるようにする。
 *
 * このプラグインは rehype-katex より「前」に走らせること。
 * KaTeX が数式を描画してしまう前に、生の TeX から \label{} を拾う必要があるため。
 *
 * 書き方:
 *   $$
 *   \label{gauss}
 *   \int_{-\infty}^{\infty} e^{-x^2}\,dx = \sqrt{\pi}
 *   $$
 *
 *   本文から参照するときは、リンクテキストを空にして href だけ書く:
 *   [](#eq-gauss)  →  「(3)」に置き換わる
 *
 * \label{} を書かなければ id は eq-1, eq-2 … と連番になる。
 */
export function rehypeEquations() {
  return (tree) => {
    const labels = new Map(); // label名 → 式番号
    let counter = 0;

    // --- 第 1 パス: 表示数式を包んで採番する ---
    //
    // remark-math ($$...$$) は mdast-util-math の既定変換により
    // <pre><code class="language-math math-display">...</code></pre> という
    // hast になる（math-display クラスが付くのは中の <code> 側で、<pre> ではない）。
    // <code> だけを差し替えて <pre> を残すと、コードブロック用の背景色
    // （.prose pre の var(--code-bg)）が数式の後ろに残ってしまい、
    // ライトモードでは地の文字色 var(--ink) と重なってほぼ読めなくなる。
    // なので <pre> ごと見つけて差し替える（rehype-katex 自身も同じ手当てをしている）。
    visit(tree, 'element', (node, index, parent) => {
      if (!parent || index === null) return;
      if (node.tagName !== 'pre') return;

      const codeChild = node.children.find(
        (c) => c.type === 'element' && c.tagName === 'code'
      );
      const classes = codeChild?.properties?.className ?? [];
      const isDisplayMath =
        Array.isArray(classes) && classes.includes('math-display');
      if (!codeChild || !isDisplayMath) return;

      counter += 1;

      // 生の TeX を取り出して \label{...} を抜く
      let label = null;
      for (const child of codeChild.children) {
        if (child.type !== 'text') continue;
        const match = child.value.match(/\\label\{([^}]+)\}/);
        if (match) {
          label = match[1];
          // KaTeX は \label を解釈できないので取り除く
          child.value = child.value.replace(/\\label\{[^}]+\}/, '').trim();
        }
      }

      const id = label ? `eq-${label}` : `eq-${counter}`;
      if (label) labels.set(label, counter);
      labels.set(String(counter), counter);

      // <div class="equation" id="eq-…"> [数式] <span class="eq-num">(N)</span> </div>
      parent.children[index] = {
        type: 'element',
        tagName: 'div',
        properties: { className: ['equation'], id },
        children: [
          {
            type: 'element',
            tagName: 'div',
            properties: { className: ['equation-body'] },
            children: [codeChild],
          },
          {
            type: 'element',
            tagName: 'span',
            properties: { className: ['eq-num'], 'aria-hidden': 'true' },
            children: [{ type: 'text', value: `(${counter})` }],
          },
        ],
      };
    });

    // --- 第 2 パス: 空リンク [](#eq-xxx) を「(N)」に差し替える ---
    visit(tree, 'element', (node) => {
      if (node.tagName !== 'a') return;
      const href = node.properties?.href;
      if (typeof href !== 'string' || !href.startsWith('#eq-')) return;

      // リンクテキストが空のときだけ番号を流し込む
      const isEmpty =
        node.children.length === 0 ||
        (node.children.length === 1 &&
          node.children[0].type === 'text' &&
          node.children[0].value.trim() === '');
      if (!isEmpty) return;

      const key = href.slice(4); // "#eq-" を落とす
      const number = labels.get(key);
      if (!number) return;

      node.properties.className = ['eq-ref'];
      node.children = [{ type: 'text', value: `(${number})` }];
    });
  };
}
