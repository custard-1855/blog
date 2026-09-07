---
title: 記事の書き方
genre: 技術
standfirst: >-
  このテンプレートで使える部品を一通り並べた見本。
  サイドノート、番号付きの数式、節ラベル、コード、表、図を実際に動かしてある。
  中身を消して自分の記事を書きはじめる出発点にしてよい。
date: 2026-09-06
facts:
  - label: 前提
    value: Markdown が書けること
  - label: 依存
    value: Astro / KaTeX
  - label: 所要
    value: 読み 10 分
---

## 文章の基本

見出しは `##` が章、`###` が節、`####` が項。番号は自動で振られるので、
`## 文章の基本` と書くだけで `1` になり、その下の `###` が `1.1`、`1.2` と続く。
左の目次にも同じ番号が出る。本文と目次は同じ採番モジュールを通っているので、
片方だけずれることはない。

番号を付けたくない見出しは `|` で明示的なラベルを書く。
このとき採番は進まないので、後続の番号がずれない。

```md
## 補遺 | 参考文献      ← ラベルは「補遺」
## | はじめに           ← ラベルも番号も無し
```

記事ごと採番を止めたいときは、front matter に `numbering: false` を書く。

### 強調とサイドノート

**太字は主張を置く場所**に使い、*ハイライトは用語や短い言い回し*に使う。
日本語には斜体が無いので、`em` は琥珀色の下地に読み替えてある。
`インラインコード` は関数名や設定値に。

脚注は普通の Markdown 記法で書けばいい[^side]。
広い画面では本文の右の余白に浮かび、狭い画面では番号を押すと開く注記になる。
記事の中身は標準的な脚注のままなので、別の場所へ持って行っても壊れない。

[^side]: これがサイドノートになる。段落を分けて書くこともできるし、`コード` や [リンク](https://example.com) も入れられる。

同じ段落に複数の注を置いても、互いに重ならないように縦へ積まれる[^stack]。
注が続くところでは、間隔が自動で空く。

[^stack]: 二つ目の注。`clear: right` で衝突を避けているので、位置の調整は要らない。

### リストと注記

比較や列挙は箇条書きにする。

- **項目 A** —— 説明文。em ダッシュで軽く区切るのがこの体裁の癖
- **項目 B** —— 説明文
- **項目 C** —— 説明文

補足や警告は引用記法で囲むと、左に琥珀の罫線が付いた注記になる。

> <span class="note-label">確かめてから次へ</span>
> ここに注意事項を書く。**強調**もそのまま使える。
> ラベルが要らなければ `<span class="note-label">` の行を消せばいい。

## 数式

### インラインと表示

インライン数式は `$...$` で書く。たとえば $e^{i\pi} + 1 = 0$ のように、
本文の行送りを崩さない大きさに調整してある。
確率 $p(x \mid \theta)$ やベクトル $\mathbf{v} \in \mathbb{R}^d$ も同様。

表示数式は `$$...$$` で書くと自動で採番される。

$$
\label{softmax}
\mathrm{softmax}(\mathbf{z})_i = \frac{e^{z_i}}{\sum_{j=1}^{K} e^{z_j}}
$$

`\label{softmax}` と書いておくと名前が付き、本文から [](#eq-softmax) のように
参照できる。リンクテキストを空にしておけば、式番号が自動で流し込まれる。
書き方は `[](#eq-softmax)` で、これが式 [](#eq-softmax) への参照になる。

ラベルを付けなくても番号は振られる。

$$
\cos(\theta) = \frac{\mathbf{a} \cdot \mathbf{b}}{\|\mathbf{a}\| \, \|\mathbf{b}\|}
$$

複数行の式も書ける。

$$
\label{elbo}
\begin{aligned}
\log p(x) &= \log \int p(x, z) \, dz \\
          &\geq \mathbb{E}_{q(z)}\!\left[ \log \frac{p(x, z)}{q(z)} \right]
\end{aligned}
$$

式 [](#eq-elbo) は式 [](#eq-softmax) と違って複数行にまたがるが、
番号の付き方は同じ。数式はビルド時に描画されるので、
読み手の側では JavaScript が一切走らない。

## コードと図表

### コードブロック

言語名を書けば色が付く。`title=` を添えるとファイル名のラベルが出る。

```py title="rag.py"
import numpy as np


def cosine_top_k(query: np.ndarray, matrix: np.ndarray, k: int = 5):
    """正規化済みの行列に対して、内積の大きい順に k 件返す。"""
    scores = matrix @ query
    idx = np.argpartition(-scores, k)[:k]
    return idx[np.argsort(-scores[idx])]
```

### 表

| 決めるもの | 既定値 | 備考 |
|---|---|---|
| `chunk_size` | 1000 文字前後 | 大きくすると文脈は保たれるが検索がぼやける |
| `chunk_overlap` | `chunk_size` の 10〜20% | 切れ目をまたぐ文を救うための保険 |
| `k` | 4〜8 | 小さいと取りこぼし、大きいとノイズが増える |

### 図

図は SVG を直接書く。色は `currentColor` に任せてあるので、
明暗どちらのテーマでも自動で合う。強調したい要素は `dg-accent` で囲む。

繰り返しになる属性は CSS 側に寄せてあるので、`class` を付けるだけで済む。

- `dg-box` 箱 / `dg-line` 線 / `dg-fill` 塗り（矢尻など）
- `dg-mono` モノスペース / `dg-dim` 補助的な文字 / `dg-accent` 琥珀色

**図の中に空行を入れないこと。** Markdown は生 HTML ブロックを空行で打ち切るので、
`<svg>` の途中に読みやすさのための空行を入れると、そこから先が
コードブロックとして表示されてしまう。字下げも 2 段までに留めておくと安全。

**`marker` の `id` には図ごとの接頭辞を付けること。**
1 ページに図を 2 つ置くと、同じ `id` が重複して片方が壊れる。

<figure>
<div class="fig-frame">
<svg viewBox="0 0 700 190" role="img" aria-label="入力から変換を経て出力に至る3段のフロー図">
  <defs>
    <marker id="fig-flow-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <polygon class="dg-fill" points="0,1 9,5 0,9"></polygon>
    </marker>
  </defs>
  <text class="dg-mono dg-dim" x="20" y="40">3 段の流れ</text>
  <rect class="dg-box" x="20" y="70" width="170" height="50" rx="3"></rect>
  <text x="42" y="100">1  入力</text>
  <rect class="dg-box" x="265" y="70" width="170" height="50" rx="3"></rect>
  <text x="287" y="100">2  変換</text>
  <g class="dg-accent">
    <rect class="dg-box is-strong" x="510" y="70" width="170" height="50" rx="3"></rect>
    <text x="532" y="100" font-weight="600">3  出力</text>
  </g>
  <g class="dg-line" marker-end="url(#fig-flow-arrow)">
    <line x1="190" y1="95" x2="259" y2="95"></line>
    <line x1="435" y1="95" x2="504" y2="95"></line>
  </g>
</svg>
</div>
<figcaption>
図のキャプション。何を示していて、どこに注目すべきかを 1〜2 文で書く。
</figcaption>
</figure>

## 補遺 | 番号を付けない見出し

`|` を使うとこの見出しのように番号が付かず、採番も進まない。
参考文献や謝辞のように、章番号を振りたくない箇所に使う。
