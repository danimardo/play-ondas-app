/* ============================================================
   Play Ondas app — Tailwind theme extract  (direction: "Aire")
   Merge `theme.extend` into your tailwind.config.js.
   Colours are wired to the CSS variables in tokens/tokens.css,
   so dark mode = toggling [data-theme="dark"] (or .dark) only.
   ------------------------------------------------------------
   Recommended dark-mode strategy:
     darkMode: ['selector', '[data-theme="dark"]']
   Import tokens.css once globally (e.g. in app.css) BEFORE Tailwind
   utilities, or via @layer base.
   ============================================================ */

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['selector', '[data-theme="dark"]'],
  content: ['./src/**/*.{svelte,ts,js,html}'],
  theme: {
    extend: {
      colors: {
        bg:        'var(--color-bg)',
        surface:   'var(--color-surface)',
        'list-bg': 'var(--color-list-bg)',
        border:    'var(--color-border)',
        line:      'var(--color-line)',
        ink:       'var(--color-ink)',
        'ink-2':   'var(--color-ink-2)',
        mut:       'var(--color-mut)',
        faint:     'var(--color-faint)',
        accent:    'var(--color-accent)',
        'accent-text': 'var(--color-accent-text)',
        track:     'var(--color-track)',
        'btn-border': 'var(--color-btn-border)',
        knob:      'var(--color-knob)',
        dot:       'var(--color-dot)',
        error:     'var(--color-error)',
        ok:        'var(--color-ok)',
        // Wave hues (theme-independent)
        wave: {
          gamma: '#D98A2B',
          beta:  '#CB6A4A',
          alfa:  '#8C9A56',
          theta: '#6E6CA8',
          brown: '#9A6B45',
        },
      },
      fontFamily: {
        sans: ['"Hanken Grotesk"', 'system-ui', 'Segoe UI', 'Roboto', 'Arial', 'sans-serif'],
        mono: ['"Space Mono"', 'ui-monospace', 'Menlo', 'monospace'],
      },
      fontSize: {
        // [size, { lineHeight, letterSpacing, fontWeight }]
        display: ['32px', { lineHeight: '1.05', letterSpacing: '-0.02em', fontWeight: '700' }],
        h2:      ['20px', { lineHeight: '1.2',  letterSpacing: '-0.01em', fontWeight: '700' }],
        title:   ['17px', { lineHeight: '1.3',  fontWeight: '700' }],
        body:    ['15px', { lineHeight: '1.55' }],
        'body-sm': ['13.5px', { lineHeight: '1.5' }],
        label:   ['13px', { lineHeight: '1.4' }],
        caption: ['12px', { lineHeight: '1.4' }],
        micro:   ['11px', { lineHeight: '1.4' }],
        kicker:  ['10.5px', { lineHeight: '1.2', letterSpacing: '0.14em' }],
      },
      spacing: {
        // 4px base scale already covered by Tailwind defaults (1=4px…)
        // app-specific one-offs:
        'list-w': '316px',     // main screen wave-list column
        'win-w':  '900px',     // default window width
        'win-h':  '620px',     // default window height
      },
      borderRadius: {
        sm: '8px',
        md: '11px',
        lg: '14px',
        xl: '18px',
        pill: '999px',
      },
      boxShadow: {
        window:  '0 16px 38px -10px rgba(40,32,20,0.26)',
        modal:   '0 24px 60px -12px rgba(0,0,0,0.40)',
        popover: '0 18px 44px -10px rgba(0,0,0,0.45)',
      },
      keyframes: {
        waveBar: {
          '0%,100%': { transform: 'scaleY(0.30)' },
          '50%':     { transform: 'scaleY(1)' },
        },
      },
      animation: {
        // apply per-bar with inline animation-delay / -duration (820–1380ms)
        waveBar: 'waveBar 1s ease-in-out infinite',
      },
      transitionTimingFunction: {
        DEFAULT: 'cubic-bezier(0.4,0,0.2,1)',
      },
    },
  },
  plugins: [],
};
