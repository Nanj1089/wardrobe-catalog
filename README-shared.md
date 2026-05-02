# Shared Wardrobe Catalog

This folder contains a lightweight wardrobe web app with a built-in shared JSON server.

## What changed

- `wardrobe-catalog.html` / `.css` / `.js` provide the editable front-end.
- `share-wardrobe-local.js` serves both the page and a shared `/api/store` endpoint.
- Data is stored in `wardrobe-shared-store.json` once the shared server receives its first save.

## Run locally

```powershell
cd D:\Codex_Data\WardrobeCatalog
node share-wardrobe-local.js
```

Then open one of the URLs printed in the terminal.

## Phone access

1. Keep the server running on your computer.
2. Make sure the phone and computer are on the same Wi-Fi.
3. Open the `Mobile:` URL printed by the server on your phone browser.

Both devices will read and write the same data file.

## Optional edit protection

Set an environment variable before starting the server:

```powershell
$env:WARDROBE_EDIT_KEY="your-secret-key"
node share-wardrobe-local.js
```

When protection is enabled, the page will ask for the edit key before saving changes.

## Deploy to a real shared host

This app can be deployed to any Node-capable host that offers either:

- a persistent disk / volume, or
- a stable mounted file path you can point `WARDROBE_DATA_FILE` at

Use:

- start command: `node share-wardrobe-local.js`
- optional env var: `WARDROBE_EDIT_KEY`
- optional env var: `WARDROBE_DATA_FILE`

Important: if the host filesystem is temporary, your shared wardrobe data will not persist after restarts. In that case, attach persistent storage first.
