# @mitsuharu/vivliostyle-theme-noto-sans-jp

フォントを Noto Sans JP と Noto Sans Mono に設定する Vivliostyle のテーマです。フォントのみを対象としているため、他のテーマとの併用は必須です。

This is a Vivliostyle theme that sets fonts to Noto Sans JP and Noto Sans Mono. If use it, you MUST use with other themes.

## Fonts

Google Fonts の Noto Sans JP と Noto Sans Mono を利用しています。Google Fonts のライセンスは商用利用、印刷、再配布を許可しています。

## Required

- @vivliostyle/cli >= 8.16.0

## Use

In `vivliostyle.config.js`:

```js
module.exports = {
  theme: [
    '@vivliostyle/theme-techbook'
    '@mitsuharu/vivliostyle-theme-noto-sans-jp',
  ],
};
```

## Anotation

- 数学表示で LaTeX 記法を利用すると T3Font (Type 3 font) が利用されます。また、このフォントは PDF に埋め込まれていません。Adobe Acrobat Pro などでアウトライン化してください。
- 図名などにおいて、全角と半角の間に Times フォントが利用されます。その Times フォントはゼロ幅のように見える、そして、フォントが埋め込まれているので、問題ないと考えてます。

## Develop

### Files

```
vivliostyle-theme-noto-sans-jp
├── LICENSE
├── README.md
├── example
│   ├── assets                            // auto generated
│   │   └── Logo (Mark + Type).png        // auto generated
│   └── default.md                        // 🖋
├── package.json
├── theme.css                             // 🖋
└── vivliostyle.config.js
```

**example**: Contain sample manuscripts using your theme.

### Commands

Run `vivliostyle preview` to preview your `theme.css`.

To watch file changes, use `preview` script.

```bash
npm run preview
# or
yarn preview
```

You can specify your CSS file and manuscript file for preview in vivliostyle.config.js:

```js
module.exports = {
  language: 'ja',
  theme: [
    'node_modules/@vivliostyle/theme-techbook',
    '.'
  ],
  entry: [
      'example/default.md',
      // and more...
  ],
}
```

Run `vivliostyle-theme-scripts validate` before publishing your package.

```bash
npm run validate
# or
yarn validate
```
