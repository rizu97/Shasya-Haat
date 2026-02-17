/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: [
        "./index.html",
        "./*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./services/**/*.{js,ts,jsx,tsx}",
        "./hooks/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: 'var(--bg-main)',
                surface: 'var(--bg-surface)',
                border: 'var(--border-color)',
            },
            fontFamily: {
                sans: ['Inter', 'Hind Siliguri', 'sans-serif'],
                bn: ['Hind Siliguri', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
