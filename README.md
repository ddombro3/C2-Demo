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

## Requirements

Before running this project, make sure you have:

- **Node.js**
- **npm**

A modern Node version is recommended.

---

## Installation

Clone the repository and move into the project folder:

```bash
git clone https://github.com/ddombro3/C2-Demo.git
cd C2-Demo
