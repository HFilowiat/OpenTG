# OpenTG (fork)

This is a **personal fork** of **OpenTG**, the open-source continuation of a previously developed video game project that is no longer under active development.  

This fork focuses on experimenting with the UI and adding a linux desktop build target. I do not plan to distribute any builds at the moment, if you wish to try any changes made you will need to build yourself.

> ⚠️ **Note:** While OpenTG is open source, the original game’s **brand name, title, and logos** remain protected.  
> Any derivative projects **must not** use the original game’s name or branding.


## 🧩 About the Project

OpenTG is built with **SvelteKit** for the web front-end and **Tauri** for the desktop versions.  

## 🧰 Prerequisites

- **Code editor:** Any editor with support for TypeScript & Rust.
- **Bun:** runtime & package manager. Install from https://bun.sh.
- **Rust & Cargo:** required for Tauri. Install via `rustup` (https://rust-lang.org).

### Linux specific system packages
Depending on your distribution you will need the WebKitGTK development packages and AppImage tooling for packaging.

### Cross compiling
If you want to build a windows .exe from linux you will need the MingGW cross toolchain and the rust windows target:
```bash
rustup target add x86_64-pc-windows-gnu
```
Example (fedora):
```bash 
sudo dnf install mingw64-gcc mingw64-gcc-c++ mingw64-binutils mingw-nsis
```

(See the notes below about NSIS and windows installers, creating the windows installer is easiest on a native windows host.)

## 📦 Installation

Clone the repository and install JS dependencies with Bun:

```bash
bun install
```
This installs dependencies used by the web app adn the Tauri desktop. Rust/cargo dependencies are fetched during the Tauri build.


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

Tauri performs two steps:
   - builds the frontend static assets
   - compiles/bundles the rust/tauri ap

### Web Build

```bash
bun run build:web
```

Package web for itch.io
```bash
bun run bundle:web
```

### Linux Build (Default: deb + AppImage)

```bash
bun run tauri:build:linux
```

**Output locations:**
.deb package:
```
src-tauri/target/x86_64-unknown-linux-gnu/release/bundle/deb/
```

AppImage:
```
src-tauri/target/x86_64-unknown-linux-gnu/release/bundle/appimage/
```

The AppImage probably won't bundle right now. 
The .deb build should work fine.

AppImage bundling requires a linux environment. If you're on windows, you could try using WSL or a linux VM

### Windows Build

To compile a windows executable from this repo on linux:
```bash
rustup target add x86_64-pc-windows-gnu # ensure target and toolchain are installed first
bun run build:windows:bundle # run the script that builds web + cross-compiles
```
Notes:
- Cross-compiling should produce a working .exe binary. However, creating an NSIS installer requires running makensis.exe which cannot be run natively on linux. For a installer you could build on a windows host.
- If you only need the .exe, it will be at:
```
src-tauri/target/x86_64-pc-windows-gnu/release/
```

### General Build

You can also run the tauri build command directly
```bash
bun run tauri build
```

## 🖼️ Generating Desktop Icons

To genereate platform-specific icons for Tauri, place a base icon at:
```
static/desktop-icon.png
```

And then run:
```bash
bun run tauri:generate:icon
```

This outputs icons to 'src-tauri/icons' and the bundler will pick the appropriate icons for each target.

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
