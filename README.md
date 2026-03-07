# C2-Demo

A split-screen **educational simulator** that demonstrates a high-level command-and-control workflow in a **safe, fully mocked environment**.

The app includes:

- a **mock operator/C2 console** on the left
- a **mock target website/server** on the right
- a **buffer visualization**
- a **stack snapshot**
- simulated **delivery path routing**
- simulated **callback/beacon behavior**

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
- Static `nmap`-style recon output
- Mock C2 IP, relay IP, and target IP display
- Route modes:
  - direct
  - relay
- Simulated package staging:
  - safe package
  - overflow-demo package
- Inbound transfer path:
  - `C2 -> Relay -> Target`
- Outbound callback/beacon path:
  - `Target -> Relay -> C2`
- Target-side mock website and server activity log
- Buffer fill visualization based on input length
- Stack snapshot that changes based on overflow state
- Simulated compromise state
- Simulated periodic beacon/check-in after compromise

---

## Tech Stack

- **React**
- **TypeScript**
- **Vite**
- **CSS**

---

## Purpose and Safety

This project exists to **visually explain concepts** in a controlled, non-operational way.

It is meant for:

- classroom demos
- portfolio presentation
- UI simulation
- high-level security concept explanation
- safe visualization of routing, staging, buffer, and beacon ideas

It is **not** a real C2 framework and is **not** designed to be deployable or used against real systems.

There is no real:

- scanning engine
- payload delivery
- remote agent
- exploit execution
- live callback traffic
- socket communication
- persistence
- remote tasking

Anything that looks like those concepts is only part of the local UI simulation.

---

## Requirements

Before running this project, make sure you have:

- **Git**
- **Node.js**
- **npm**

A modern Node.js version is recommended.

You can verify your tools with:

```bash
git --version
node -v
npm -v
