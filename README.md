# Todovex - An Open Source Todoist Clone (runs fully offline)


Built with the Next.js 14 App Router, Convex (local deployment), React, ShadCN UI library, React Hook Forms, TypeScript, TailwindCSS and more


![Project Image](https://www.todovex.ai/og-image.png)

## Features
- 🌐 Next.js & Server actions
- 🎨 Beautiful components using Shadcn UI
- 💅 Slick designs using TailwindCSS
- 🌟 Database using Convex
- 🎭 Amazing icons thanks to Lucide React
- 📋 Typescript Runtime Validation using Zod
- 🚀 Form Validation using React Hook Forms
- ❤️ Add Task Dialog popup
- 💔 Deletion of Tasks Dialog popup
- ✚ Addition of Sub-Tasks
- 💔 Deletion of Sub-Tasks Dialog popup
- 📜 Creation of New Projects and Labels
- 📜 Deletion of New Projects and Labels
- 🔄 Sidebar Navigation
- 🔎 Search your Tasks
 - 📱Full mobile responsiveness 
- 🛬 Landing page 🛬
- 🚀 Deployment on Vercel
- 📱 Mobile responsiveness
- 🎁 ...much more

## Getting started (offline, no accounts or API keys)

This branch runs entirely on your machine: there is no sign-in (you are always the
"Local user") and no AI features. Data lives in a local Convex deployment.

```bash
npm install
npm run dev
```

`npm run dev` starts Next.js (http://localhost:3000) and a local Convex backend
(http://127.0.0.1:3210), and seeds the default Inbox project and labels.

- The first run downloads the Convex backend binary and may ask a couple of
  setup questions (choose the local deployment, no account needed). After that
  it works offline.
- Connection settings are written to `.env.local` by Convex. See `.env.sample`.
- Local data is stored in `.convex/local/` inside this project (git-ignored); the
  backend binary is cached in `~/.cache/convex`. To start fresh, stop the dev
  server, delete `.convex/local/`, and run `npm run dev` again.

## 1. How to fork and clone
- If you want to make changes and contribute to this project, you'll need to create a fork first.  Forking creates a copy of the original project in your own GitHub account. This lets you experiment with edits without affecting the main project.

- Look for the "Fork" button in the top right corner of the project on GitHub. Clicking it will create a copy under your account with the same name.
![image](https://github.com/kulkarniankita/todoist-clone-todovex/assets/2559673/f10c45ab-e2aa-4334-b32a-dcaa2873241a)

- After forking the project, you can clone it just like you usually do.


## Acknowledgements

- [Convex](https://convex.dev/c/todovex) for making this project possible

## License

[MIT](https://choosealicense.com/licenses/mit/)
