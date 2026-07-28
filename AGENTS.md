# AGENTS.md

Guidance for cloud agents working in this repository.

## Repository overview

This repo contains two products:

1. **Manoj's Blog** (root) — Static personal site (HTML/CSS/JS). No build step, no package manager.
2. **Blender MCP Connector** (`blender-mcp/`) — Optional Python MCP server + Blender add-on. Requires `uv` and Blender 3.0+ (GUI only; cannot run Blender in headless cloud VMs).

## Cursor Cloud specific instructions

### Blog (primary dev target)

- **Serve locally:** `python3 -m http.server 8000` from the repo root.
- **URL:** http://localhost:8000
- **Why HTTP is required:** Gallery and other pages use `fetch()` against `gallery/manifest.json`; opening files via `file://` will not work reliably.
- **No lint or test suite** exists for the static site. Validate by loading pages in a browser and checking the gallery manifest loads (`curl http://localhost:8000/gallery/manifest.json`).
- **Optional external services** (network required, not needed for basic local dev):
  - GitHub API — `write/` and `manage/` CMS (needs PAT in browser `localStorage`)
  - `abacus.jasoncameron.dev` — article upvotes
  - `iss-widget-atdgzfyi.devinapps.com` — ISS tracker iframe
  - CDN fonts and `marked.js` on write/manage pages

### Blender MCP (secondary, local-desktop only)

- **Install deps:** `cd blender-mcp && uv sync` (requires `uv` on PATH — typically `~/.local/bin`).
- **Run server (stdio MCP):** `uv run blender-mcp-local` from `blender-mcp/`, or `uvx --from ./blender-mcp blender-mcp-local` from repo root.
- **Blender add-on:** Install `blender-mcp/addon.py` in Blender → Preferences → Add-ons, then start the socket server from the BlenderMCP sidebar panel (default `localhost:9876`).
- **Verify without Blender:** `uv run python -c "import server; print(server.main)"` confirms the Python package imports; full E2E requires a local Blender GUI instance.

### Common commands

| Task | Command |
|------|---------|
| Start blog dev server | `python3 -m http.server 8000` |
| Install Blender MCP deps | `cd blender-mcp && uv sync` |
| Check Python syntax | `python3 -m py_compile blender-mcp/server.py blender-mcp/addon.py` |
| Import-check MCP server | `cd blender-mcp && uv run python -c "import server"` |

### Deployment

Production hosting is GitHub Pages (`manojponugoti64.github.io`). Push to `main` — no build pipeline in this repo.
