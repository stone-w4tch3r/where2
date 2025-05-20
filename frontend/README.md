# Where2 Map Overlay Extension

A web browser extension that finds maps on webpages and overlays station information on them.

## Features

- Automatically detects Leaflet and Google Maps instances on web pages
- Overlays station information on detected maps
- Toggle overlay visibility from the extension popup
- Works on any website with map elements

## Development

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or later)
- [pnpm](https://pnpm.io/) package manager

### Setup

1. Clone the repository:

   ```
   git clone https://github.com/yourusername/where2.git
   cd where2/frontend
   ```

2. Install dependencies:

   ```
   pnpm install
   ```

3. Build the extension:
   ```
   pnpm build:extension
   ```

### Running with Firefox

To run the extension in Firefox Developer Edition during development:

1. Install web-ext if you haven't already:

   ```
   pnpm add -D web-ext
   ```

2. Build the extension:

   ```
   pnpm build:extension
   ```

3. Run with Firefox Developer Edition:
   ```
   pnpm dev:extension:firefox
   ```

Alternatively, you can load the extension temporarily in Firefox:

1. Open Firefox
2. Navigate to `about:debugging`
3. Click "This Firefox"
4. Click "Load Temporary Add-on"
5. Select the `manifest.json` file in the `dist` folder

### Running with Chrome

1. Build the extension:

   ```
   pnpm build:extension
   ```

2. Open Chrome
3. Navigate to `chrome://extensions`
4. Enable "Developer mode"
5. Click "Load unpacked"
6. Select the `dist` folder

## Building for Production

```
pnpm build:extension
```

The built extension will be in the `dist` folder, ready to be packaged and distributed.

## Project Structure

- `manifest.json` - Extension manifest file
- `popup.html` - Extension popup UI
- `src/`
  - `background.ts` - Extension background script
  - `content.tsx` - Content script injected into webpages
  - `popup.ts` - Popup script
  - `utils/MapDetector.ts` - Utility to detect maps on webpages
  - Other components and utilities from the Where2 application
- `public/` - Static assets
