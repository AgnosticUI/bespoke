# React TS + ShadCN + Tailwind

This is just a simplified page with a single button dead center! I left <root>/src/index.css en tact (just used flex-direction: column but otherwise defaults kept)

How this was setup:

```shell
npm create vite@latest my-app -- --template react-ts
mv my-app shadcn-verify # and global search/replaced
cd shadcn-verify/
npm i
npm install tailwindcss @tailwindcss/vite
npx shadcn@latest init
npx shadcn@latest add button
npm run dev
```
