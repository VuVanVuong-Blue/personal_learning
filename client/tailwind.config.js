/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    safelist: [
        'bg-indigo-600', 'bg-pink-600', 'bg-purple-600', 'bg-blue-600', 'bg-emerald-600', 'bg-orange-600',
        'border-t-indigo-500', 'border-t-pink-500', 'border-t-purple-500', 'border-t-blue-500', 'border-t-emerald-500', 'border-t-orange-500'
    ],
    theme: {
        extend: {},
    },
    plugins: [],
}
