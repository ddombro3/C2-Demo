# C2-Demo

A split-screen **educational simulator** that demonstrates a high-level command-and-control workflow in a **safe, fully mocked environment**.

The app includes:

- a **mock operator / C2 console** on the left
- a **mock target website / server** on the right
- a **buffer visualization**
- a **stack snapshot**
- simulated **delivery path routing**
- simulated **callback / beacon behavior**

This project is for **visual demonstration only**.

It does **not** perform any real:

- scanning
- proxying
- payload generation
- network communication
- exploitation
- remote control

Everything is handled with **local React state** and **static demo responses**.

---

## Features

- Linux-style mock terminal with prompt
- Static nmap-style recon output
- Mock C2 IP, relay IP, and target IP display
- Route modes:
  - direct
  - relay
- Simulated package staging:
  - safe package
  - overflow-demo package/msfvenom
- Simulated inbound transfer path:
  - `C2 -> Relay -> Target`
- Simulated outbound callback / beacon path:
  - `Target -> Relay -> C2`
- Target-side mock website and server activity log
- Buffer fill visualization based on input length
- Stack snapshot that changes based on overflow state
- Simulated compromise state
- Simulated periodic beacon / check-in behavior after compromise

---

## Tech Stack

- **React**
- **TypeScript**
- **Vite**
- **CSS**

---

## Requirements

Before running this project, make sure you have:

- **Git**
- **Node.js**
- **npm**

A modern Node.js version is recommended.

You can verify your tools are installed by running:

```bash
git --version
node -v
npm -v
```

---

## Installation and Running

### 1. Clone the repository

```bash
git clone https://github.com/ddombro3/C2-Demo.git
```

### 2. Move into the project folder

```bash
cd C2-Demo
```

### 3. Install dependencies

```bash
npm install
```

This installs everything the project needs from `package.json`.

### 4. Start the development server

```bash
npm run dev
```

After the server starts, Vite will print a local URL in the terminal.

It will usually look like this:

```text
http://localhost:5173
```

### 5. Open the app in your browser

Copy the local URL shown in the terminal and open it in your browser.

### 6. Stop the development server

When you are done, return to the terminal and press:

```text
Ctrl + C
```

---

## Other Useful Commands

### Build the project for production

```bash
npm run build
```

This creates an optimized production build in the `dist/` folder.

### Preview the production build locally

```bash
npm run preview
```

This serves the production build locally so you can test the final built version in your browser.

A common production test flow is:

```bash
npm install
npm run build
npm run preview
```

### Run the project in VS Code

Open the project folder:

```bash
code .
```

Then open the built-in terminal in VS Code and run:

```bash
npm install
npm run dev
```

Then open the localhost URL shown in the terminal.

### Available npm commands

- `npm install` — installs all project dependencies
- `npm run dev` — starts the Vite development server with hot reload
- `npm run build` — creates an optimized production build in `dist/`
- `npm run preview` — serves the production build locally for testing

---

## How the Demo Works

This application is a **visual browser-based simulator**. It demonstrates the idea of an operator console interacting with a target environment, but everything is mocked and runs locally in the front end.

### Left Panel: Mock Operator / C2 Console

The left side simulates an operator console and may include:

- a terminal-style interface
- static recon-style output
- route selection
- simulated package staging
- simulated delivery actions
- simulated callback / beacon display

### Right Panel: Mock Target Website / Server

The right side simulates a target environment and may include:

- a mock website or server panel
- a server activity log
- buffer visualization
- stack snapshot
- simulated compromise state
- simulated outbound callback / beacon behavior

### Internal Logic

Everything is driven by:

- React state
- component rendering
- static demo text
- local timers
- conditional UI updates

There is **no real network communication**, **no real agent**, and **no real exploitation**.

### Example Demo Walkthrough

A typical demo flow might look like this:

1. Run `npm run dev`
2. Open the local URL shown in the terminal
3. View the split-screen interface
4. Use the left-side mock terminal
5. Trigger the static recon-style output
6. Select a route mode:
   - `direct`
   - `relay`
7. Select a staged package:
   - `safe package`
   - `overflow-demo package`
8. Trigger the simulated inbound path
9. Watch the target-side log update
10. Observe the buffer visualization change
11. Observe the stack snapshot change
12. Watch the simulated callback / beacon behavior after the mock compromise state appears

---

## Project Structure

A typical project structure may look like this:

```text
C2-Demo/
├── public/
├── src/
│   ├── components/
│   ├── App.tsx
│   ├── main.tsx
│   ├── index.css
│   └── ...
├── package.json
├── package-lock.json
├── tsconfig.json
├── vite.config.ts
├── .gitignore
└── README.md
```

Your exact layout may vary depending on how you organized the components.

---

## Troubleshooting

### `git: command not found`

Git is not installed or not on your PATH.

Install Git, then verify:

```bash
git --version
```

### `node: command not found` or `npm: command not found`

Node.js or npm is not installed or not on your PATH.

Install Node.js, then verify:

```bash
node -v
npm -v
```

### `npm install` fails

Try:

```bash
npm cache clean --force
npm install
```

### Port already in use

If Vite's default port is already busy, it may automatically choose another port.

Check the terminal output and open the URL it gives you.

### The page opens but looks broken

Check that:

- `npm install` completed successfully
- all files were cloned correctly
- there are no terminal errors
- imports and file paths are correct

### The build fails

Run:

```bash
npm run build
```

Then read the terminal error output carefully.

Common causes include:

- missing imports
- TypeScript errors
- wrong file paths
- bad component exports

---

## What This Project Does Not Do

To avoid confusion, this project does **not** perform any real:

- port scanning
- enumeration
- exploitation
- proxying
- payload generation
- shell access
- persistence
- socket communication
- remote task execution
- malware behavior
- live callbacks

Anything that resembles those ideas is part of the demo only.

---

## Safety Note

This repository is intentionally limited to a **safe, local, non-operational, educational scope**.

It is designed to help explain and visualize:

- operator vs target views
- simulated routing paths
- staged delivery concepts
- buffer and stack ideas
- server-side log changes
- periodic beacon-style check-ins

It is **not** intended to be a real offensive tool.

---



## Author

Created as a safe educational simulator for demonstrating high-level C2-style workflow concepts in a controlled, fully mocked environment.
