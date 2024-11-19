module.exports = {
  language: 'ja',
  theme: [
    'node_modules/@vivliostyle/theme-techbook',
    '.',
  ],
  entry: ['example/default.md'],
  workspaceDir: '.vivliostyle',
  output: [
    'dist/book.pdf',
    {
      path: './dist/book',
      format: 'webpub',
    },
  ],
};
