import typography from '@tailwindcss/typography';

export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        ink: 'var(--color-ink)',
        muted: 'var(--color-muted)',
        line: 'var(--color-line)',
        paper: 'var(--color-paper)',
        surface: 'var(--color-surface)',
        brand: 'var(--color-brand)',
        'brand-strong': 'var(--color-brand-strong)',
        accent: 'var(--color-accent)',
        warning: 'var(--color-warning)',
      },
      fontFamily: {
        sans: ['Source Sans 3 Variable', 'Source Sans 3', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 3px 8px rgba(24, 33, 47, 0.09)',
      },
    },
  },
  plugins: [typography],
};
