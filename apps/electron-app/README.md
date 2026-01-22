# Electron Desktop Integration

## Setup

1. Make sure your Next.js frontend (apps/web) is running locally on port 3000:
   ```sh
   pnpm dev --filter web
   ```
2. In a separate terminal, start the Electron desktop app:
   ```sh
   pnpm start --filter electron-app
   ```

## Structure
- Electron main process: apps/electron-app/main.js
- Electron config: apps/electron-app/package.json

## Notes
- The Electron app loads your Next.js frontend from http://localhost:3000.
- For production, you can build the Next.js app and serve static files using Electron.
