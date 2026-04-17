# NexChat Frontend

A production-grade React frontend for the Real-Time Chat API. Dark, refined aesthetic with real-time messaging, typing indicators, offline delivery, and unread badges.

## Setup

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`. Proxied to your API at `https://localhost:7063`.

## Features

- Auth — register and login with JWT
- Room sidebar — create, select, delete rooms, unread badges
- Real-time messages via SignalR WebSocket
- Typing indicators with animated dots
- Offline message delivery on reconnect
- Cursor-based pagination — scroll up to load history
- Members panel — view and add members
- Connection status indicator (connected / reconnecting / offline)
- Toast notifications
- Keyboard shortcut — Enter to send, Shift+Enter for newline

## Stack

- React 18
- Vite
- @microsoft/signalr
- No UI library — 100% custom CSS
