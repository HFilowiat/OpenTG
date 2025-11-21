# OpenTG (fork)

This is a **personal fork** of **OpenTG**, the open-source continuation of a previously developed video game project that is no longer under active development.  

This fork will focus primarily on experimenting with the UI, and creating a Linux desktop build (I have yet to really look at the code, mind you).

I rather doubt I will be distributing a build anywhere for the time being. So, if you want to look at any changes made, you will have to build it yourself.

> ⚠️ **Note:** While OpenTG is open source, the original game’s **brand name, title, and logos** remain protected.  
> Any derivative projects **must not** use the original game’s name or branding.


## 🧩 About the Project

OpenTG is built with **SvelteKit** for the web front-end and **Tauri** for the Windows desktop version.  

## 🧰 Prerequisites

Before setting up OpenTG, install the following tools:

### 1. Code Editor
- [Visual Studio Code (VSCode)](https://code.visualstudio.com/) — **recommended**.  
- Alternatively, use any IDE that supports JavaScript/TypeScript and Rust development.

### 2. Bun
OpenTG uses [Bun](https://bun.sh) as its runtime and package manager.

### 3. Cargo (for Tauri)
The desktop version is built with [Tauri](https://tauri.app/), which requires [Rust and Cargo](https://doc.rust-lang.org/cargo/getting-started/installation.html).

## 📦 Installation

Clone the repository and install dependencies with Bun:

```bash
bun install
```

This installs all required packages for both the web and desktop builds.


## 🚀 Running the Project

Start the Web Version
Run the local development server:

```bash
bun run dev:web
```

This starts the SvelteKit app locally, typically at http://localhost:5173

## 🗂️ Project Structure

```
project-root/
├── src/                 # SvelteKit project source
│ ├── lib/               # Reusable modules, assets, and logic
│ │ ├── assets/          # Images, sounds, and other static game assets
│ │ ├── components/      # Svelte components used across the app
│ │ └── ts/              # TypeScript files for game logic and systems
│ │
│ ├── routes/            # UI routes and game interface (Svelte pages)
│ │ ├── +layout.svelte   # Root layout component
│ │ ├── (game)/          # Game route and UI
│ │ └── (mainmenu)/      # MainMenu route and UI
│ │
│ └── app.html           # HTML template for SvelteKit
│
├── src-tauri/           # Tauri source code for desktop build
│ ├── src/               # Rust backend
│ ├── icons/             # App icons for desktop packaging
│ └── tauri.conf.json    # Tauri configuration file
│
├── static/              # Static files (favicon, desktop icons)
│ ├── desktop-icon.png
│ └── favicon.svg
│
├── .dist/               # Bundled builds for distribution (e.g., Itch.io)
│ └── web/
│   └── OpenTG-web-v0.2.1
│
├── package.json         # Project dependencies and scripts
├── svelte.config.js     # SvelteKit configuration
└── tsconfig.json        # TypeScript configuration
```

## Building the Project

### Web Build

```bash
bun run build:web
```

Then bundle the game into a zip file to easily upload it on itchio by running the command

```bash
bun run bundle:web
```

### Windows Build

To build an exe installer for windows run the command

```bash
bun run tauri build
```

## 🖼️ Generating Desktop Icons

To generate platform-specific icons for the Tauri desktop version, follow these steps:

1. Place your base icon image and rename it to `desktop-icon.png` inside the `/static` directory.  
   This image will serve as the source for all generated icons.

2. Run the following command in your terminal:

   ```bash
    bun run tauri:generate:icon
    ```
    This will output generated icons into:
    ```bash
    src-tauri/icons
    ```
    These icons will automatically be used in the Tauri desktop build.


## ⚖️ Usage Policy

OpenTG is released as an **open-source rewrite** of the original game. You are free to:

- Fork, modify, and distribute the project.  
- Create your own games or tools based on this codebase.  
- Monetize derivative works if desired.

However, **you may not**:

- Use the original game’s **name, brand, or logos** in your projects.  
- Present derivative works as official or endorsed by the original development team.

You **can** reference the project as being *“based on OpenTG”* — but **not** under the original game’s title.


## 🧑‍💻 Fork maintainer note

This fork is part of my effort to experiment and explore making apps with Linux desktop support.
It is **not** affiliated with the original development team or the maintainers of OpenTG.


## 📜 License

All code and assets in this project are released under the MIT License (see the [`LICENSE`](LICENSE) file for details).
You are free to use, modify, and distribute this fork, provided you:
   - Follow the MIT license terms
   - Follow the upstream project's brand-usage restrictions.
