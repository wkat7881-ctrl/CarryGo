/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // CarryGo brand — purple (restored)
        brand:         '#6D5EF5',
        'brand-dark':  '#5A4DE0',
        'brand-light': '#EDEBFF',
        // Neutrals
        ink:           '#0D0D0D',
        secondary:     '#6B6B6B',
        muted:         '#ADADAD',
        surface:       '#F8F7FF',   // very light lavender — barely visible
        border:        '#EAEAEA',
        'border-strong':'#D0D0D0',
        // Semantic
        success:       '#17A55A',
        'success-bg':  '#EDFAF3',
        warning:       '#D97706',
        'warning-bg':  '#FFFBEB',
        danger:        '#DC2626',
        'danger-bg':   '#FFF1F1',
      },
      borderRadius: {
        sm:   '6px',
        md:   '10px',
        lg:   '14px',
        xl:   '20px',
        '2xl':'24px',
        pill: '9999px',
        full: '9999px',
      },
      boxShadow: {
        // Purple-tinted card shadow — Option 2 signature
        card:   '0 2px 8px rgba(109,94,245,0.08)',
        'card-hover': '0 4px 16px rgba(109,94,245,0.14)',
        float:  '0 4px 20px rgba(0,0,0,0.12)',
        none:   'none',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
