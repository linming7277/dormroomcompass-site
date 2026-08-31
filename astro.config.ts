import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import compress from 'astro-compress';

import { siteConfig } from './src/config/site.config';
import { publishingConfig } from './src/config/publishing.config';

const productionIndexing = publishingConfig.indexingMode === 'production';

export default defineConfig({
  site: siteConfig.url,
  output: 'static',
  integrations: [
    ...(productionIndexing
      ? [
          sitemap({
            filter: (page) => !page.includes('/drafts/'),
          }),
        ]
      : []),
    compress({
      CSS: false,
      HTML: {
        'html-minifier-terser': {
          removeAttributeQuotes: false,
        },
      },
      Image: false,
      JavaScript: true,
      SVG: false,
      Logger: 1,
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@': new URL('./src', import.meta.url).pathname,
      },
    },
  },
});
