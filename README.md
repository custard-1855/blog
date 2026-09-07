# 技術ブログ

Astro + GitHub Pages。Markdown で書くと、サイドノート・番号付きの数式・
目次レールが自動で組み上がる。数式はビルド時に描画されるので、
読み手の側では JavaScript が走らない。

## 最初にやること

### 1. 公開先を設定する

`astro.config.mjs` の先頭を、置き場所に合わせて書き換える。

**`<ユーザー名>.github.io` という名前のリポジトリの場合**

```js
site: 'https://<ユーザー名>.github.io',
// base の行は削除する
```

**それ以外のリポジトリ（`<ユーザー名>.github.io/<リポジトリ名>` で公開される）の場合**

```js
site: 'https://<ユーザー名>.github.io',
base: '/<リポジトリ名>',
```

### 2. GitHub 側の設定

リポジトリの **Settings → Pages → Build and deployment** で、
Source を **GitHub Actions** にする。ここを「Deploy from a branch」のままにすると
ワークフローが動いても反映されないので注意。

### 3. push する

`main` に push すると `.github/workflows/deploy.yml` が走り、
ビルドしてそのまま公開される。

## 手元で書く

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # dist/ に出力
npm run preview  # ビルド結果を確認
```

記事は `src/content/posts/` に `.md` を置くだけ。ファイル名が URL になる
（`sample.md` → `/posts/sample/`）。

## どこを編集すればいいか

| 内容 | 編集場所 |
|---|---|
| 記事本文 | `src/content/posts/*.md`（front matter は下の「記法」を参照） |
| About ページ | `src/pages/about.astro`。コンテンツコレクションではなく手書きの1ページなので、ファイル内の `NAME` / `BIO` / `CAREER` / `SKILLS` を直接書き換える |
| サイト名（ヘッダーの表題） | `src/lib/site.mjs` の `SITE_TITLE` |
| WORKS 一覧 | `src/content/works.json`。1エントリ = `{ id, year, type, title, url }` |
| 配色・字の大きさ | `src/styles/main.css`（詳細は下の「配色と字の大きさを変える」） |

編集したら `npm run dev` でプレビューし、公開するときは `main` に push するだけでよい
（`.github/workflows/deploy.yml` が自動でビルド・デプロイする）。

## 記法

### front matter

```yaml
---
title: 記事のタイトル
genre: 技術                  # 技術 / 学び / 思考。表題の上のラベルと WRITING のタブに使う
standfirst: リード文。一覧ページの説明文にも使われる。
date: 2026-09-06
draft: false                 # true にすると公開されない
numbering: true              # false にすると章・節の採番をしない
facts:                       # 表題の下に並ぶメタ情報（省略可）
  - label: 前提
    value: Python が読めること
  - label: 所要
    value: 読み 40 分
---
```

### 見出しと採番

`##` が章、`###` が節、`####` が項。**番号は自動で振られる。**

```md
## 文章の基本        → 1
### 強調             → 1.1
### リスト           → 1.2
#### 入れ子          → 1.2.1
## 数式             → 2
```

左の目次にも同じ番号が出る。本文と目次は同じ採番モジュール
（`src/lib/numbering.mjs`）を通るので、片方だけずれることはない。

番号を付けたくない見出しは `|` で明示的なラベルを書く。
このとき採番は進まないので、後続の番号がずれない。

```md
## 補遺 | 参考文献      ← ラベルは「補遺」
## | はじめに           ← ラベルも番号も無し
```

記事ごと採番を止めるには、front matter に `numbering: false` を書く。

見出しの `id`（目次のリンク先）は番号を除いた本文から作られるので、
章を差し込んで番号がずれても**リンクは壊れない**。

### サイドノート

標準の Markdown 脚注をそのまま書く。

```md
埋め込みモデルは途中で変えられない[^embed]。

[^embed]: 変えたら全件を埋め込み直すことになる。
```

広い画面（80rem 以上）では本文の右の余白に浮かび、
狭い画面では番号を押すと開く注記になる。注が並んでも自動で縦に積まれる。

記事の中身は標準的な脚注記法のままなので、
別のサイトや別の生成器へ持って行っても壊れない。

### 数式

インラインは `$...$`、表示数式は `$$...$$`。表示数式は自動で採番される。

````md
$$
\label{softmax}
\mathrm{softmax}(\mathbf{z})_i = \frac{e^{z_i}}{\sum_j e^{z_j}}
$$

式 [](#eq-softmax) のとおり、
````

`\label{名前}` を書くと `#eq-名前` で参照できる。
本文側は **リンクテキストを空にする** のがポイントで、
`[](#eq-softmax)` と書けば式番号 `(1)` が自動で入る。

ラベルを付けなくても番号は振られる（`#eq-1`, `#eq-2` … で参照できる）。

### コード

言語名と、必要ならファイル名を書く。

````md
```py title="rag.py"
import numpy as np
```
````

### 注記

引用記法がそのまま注記の囲みになる。ラベルは省略してよい。

```md
> <span class="note-label">確かめてから次へ</span>
> ここに注意事項を書く。
```

### 図

SVG を直接書く。色は `currentColor` に任せてあるので、
明暗どちらのテーマでも自動で合う。

繰り返しになる属性は CSS に寄せてあるので、`class` を付けるだけでよい。

| class | 用途 |
|---|---|
| `dg-box` | 箱（枠線のみ）。`is-strong` を足すと線が太くなる |
| `dg-line` | 線・矢印の軸 |
| `dg-fill` | 塗る要素（矢尻など） |
| `dg-mono` | モノスペースの小さな文字 |
| `dg-dim` | 補助的な文字（薄くなる） |
| `dg-accent` | 中身をまとめて琥珀色にする（`<g>` に付ける） |

```html
<figure>
  <div class="fig-frame">
    <svg viewBox="0 0 700 190" role="img" aria-label="図の説明">
      <defs>
        <marker id="fig-flow-arrow" viewBox="0 0 10 10" refX="9" refY="5"
                markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <polygon class="dg-fill" points="0,1 9,5 0,9"></polygon>
        </marker>
      </defs>

      <rect class="dg-box" x="20" y="70" width="170" height="50" rx="3"></rect>
      <text x="42" y="100">1  入力</text>

      <g class="dg-line" marker-end="url(#fig-flow-arrow)">
        <line x1="190" y1="95" x2="259" y2="95"></line>
      </g>
    </svg>
  </div>
  <figcaption>キャプション。</figcaption>
</figure>
```

書体と文字の大きさは `<svg>` に既定値が入っているので、指定しなくてよい。
`aria-label` には図が何を示しているかを一文で書く（読み上げに使われる）。

**注意 1 — 図の中に空行を入れない。**
Markdown は生 HTML ブロックを空行で打ち切るので、読みやすさのために
`<svg>` の途中へ空行を挟むと、そこから先がコードブロックとして表示される。
字下げも 2 段（4 文字未満）に留めておくと、万一分断されてもコード扱いされにくい。

**注意 2 — `marker` の `id` には図ごとの接頭辞を付ける。**
1 ページに図を 2 つ置いたとき、`id="arrow"` のような名前だと重複し、
`url(#arrow)` が意図しないほうに解決される。`fig-flow-arrow` のように図の名前を含める。

**注意 3 — 矢尻の色は `dg-accent` を継承しない。**
`marker` の中の `currentColor` は、参照元の線ではなく `marker` 自身が
継承した色に解決される。琥珀色の矢印が要るときは、
`<defs class="dg-accent">` の中にもう一つ marker を定義して使い分ける。

```html
<defs class="dg-accent">
  <marker id="fig-flow-arrow-accent" ...>
    <polygon class="dg-fill" points="0,1 9,5 0,9"></polygon>
  </marker>
</defs>
```

## 配色と字の大きさを変える

すべて `src/styles/main.css` の先頭にまとまっている。

- 色は `:root` の CSS 変数。暗色テーマは同じ変数を上書きしているだけなので、
  片方だけ変えるともう片方とずれる点に注意（両方そろえて変える）
- 字の大きさは `--step--1` 〜 `--step-4`。`clamp()` なので画面幅に応じて伸びる。
  全段が同じ比で動くため、本文だけ大きくして崩れることがない
- 琥珀色のラベル（eyebrow・メタ情報・式番号・注記の見出し）は `--label-scale`
  でまとめて調整する（既定 1.15）
- 章番号・節番号は `--chapter-num-size` / `--section-num-size`。
  既定ではそれぞれの見出しと同じ大きさ（`--step-3` / `--step-2`）で、
  番号と見出しが 1 行に並ぶ。小さく従属させたいなら `var(--label-lg)` に戻す
- 行長は `--measure`（既定 38rem ≒ 日本語で 38 字/行）
- 3 カラムの寸法は `--rail-w` / `--main-w` / `--note-w` / `--col-gap`。
  合計が `.shell` の `max-width` と 3 カラムの分岐点（80rem）に対応しているので、
  変えるときはこの 3 つを揃える

## 仕組み

Markdown → HTML の変換の途中に、3 つの自作プラグインが挟まっている
（`src/plugins/`、登録は `astro.config.mjs`）。

| プラグイン | 段階 | やること |
|---|---|---|
| `remark-heading-numbers` | remark | 章・節番号を振り、目次データを frontmatter に書き出す |
| `rehype-sidenotes` | rehype | 標準の脚注をサイドノートに組み替え、記事末の脚注一覧を消す |
| `rehype-equations` | rehype | 表示数式を採番し、`\label` と空リンクの参照を解決する |

採番が **remark** 段階なのには理由が二つある。
frontmatter への追記が `remarkPluginFrontmatter` に伝わるのは remark 段階だけであること、
そして Astro が `headings` を抜くのは rehype のあとなので、
そこで番号を入れると目次用のテキストに番号が混ざってしまうこと。

`rehype-equations` は `rehype-katex` より **前** に走らせる必要がある。
KaTeX が数式を描画してしまう前に、生の TeX から `\label{}` を拾うため。

プラグインを書き換えたときは、Astro のキャッシュが残っていて
反映されないことがある。その場合は `rm -rf .astro dist` してから再ビルドする。
