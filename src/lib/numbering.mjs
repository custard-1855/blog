/**
 * 見出しの採番。
 *
 * 本文（rehype プラグイン）と目次（Post.astro）の両方から呼ぶ。
 * 別々に数えると片方だけずれるので、必ずここを通すこと。
 *
 *   ## 文章の基本      → 1
 *   ### 強調            → 1.1
 *   ### リスト          → 1.2
 *   #### 入れ子         → 1.2.1
 *   ## 数式            → 2
 *
 * 番号を付けたくない見出しは「|」で明示的なラベルを書く。
 * このとき採番は進まないので、後続の番号がずれない。
 *
 *   ## 補遺 | 参考文献  → ラベル「補遺」
 *   ## | はじめに        → ラベル無し（番号も付かない）
 */

/** 見出しの文字列を「明示ラベル」と「見出し本体」に割る。 */
export function splitLabel(text) {
  const i = text.indexOf('|');
  if (i === -1) return { explicit: null, text: text.trim() };
  return { explicit: text.slice(0, i).trim(), text: text.slice(i + 1).trim() };
}

/**
 * 採番用のカウンタを作る。返る関数を見出しの出現順に呼ぶこと。
 * @param {boolean} enabled front matter の numbering が false なら採番しない
 */
export function createNumberer(enabled = true) {
  let chapter = 0;
  let section = 0;
  let item = 0;

  return function next(depth, explicit) {
    // 明示ラベルが書かれていれば、それを使って採番は進めない
    if (explicit !== null && explicit !== undefined) {
      return explicit === '' ? null : explicit;
    }
    if (!enabled) return null;

    if (depth === 2) {
      chapter += 1;
      section = 0;
      item = 0;
      return String(chapter);
    }
    if (depth === 3) {
      section += 1;
      item = 0;
      return chapter === 0 ? String(section) : `${chapter}.${section}`;
    }
    if (depth === 4) {
      item += 1;
      return chapter === 0
        ? `${section}.${item}`
        : `${chapter}.${section}.${item}`;
    }
    return null;
  };
}
