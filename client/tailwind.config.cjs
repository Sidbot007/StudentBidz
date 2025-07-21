module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: "hsl(var(--card))",
        'card-foreground': "hsl(var(--card-foreground))",
        popover: "hsl(var(--popover))",
        'popover-foreground': "hsl(var(--popover-foreground))",
        primary: '#2563eb', // blue-600
        accent: '#f59e42', // orange-400
        muted: '#f3f4f6', // gray-100
        'primary-foreground': '#fff',
        'secondary': '#64748b', // slate-500
        'secondary-foreground': '#fff',
        'destructive': '#ef4444', // red-500
        'destructive-foreground': '#fff',
        border: '#e5e7eb', // gray-200
        input: '#e5e7eb',
        ring: '#2563eb',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-to-b': 'linear-gradient(to bottom, var(--tw-gradient-stops))',
      },
      borderRadius: {
        lg: "1rem",
        md: "0.75rem",
        sm: "0.5rem",
      },
      boxShadow: {
        card: '0 4px 24px 0 rgba(0,0,0,0.06)',
        nav: '0 2px 8px 0 rgba(0,0,0,0.04)',
      },
    },
  },
  plugins: [],
}; 