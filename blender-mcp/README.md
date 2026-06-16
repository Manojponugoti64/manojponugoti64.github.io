# Blender MCP Connector

A self-contained [Model Context Protocol](https://modelcontextprotocol.io)
connector for [Blender](https://www.blender.org/). It lets an MCP client
(Claude Code, Claude Desktop, etc.) inspect and drive a running Blender
instance — create objects, set materials, run scripts, render, and more.

```
MCP client  <--stdio/MCP-->  server.py  <--TCP/JSON-->  Blender add-on (addon.py)
```

- **`server.py`** — the MCP server. Launched by your MCP client; exposes the
  tools and forwards each call to Blender over a socket.
- **`addon.py`** — the Blender add-on. Runs a small socket server *inside*
  Blender and executes commands on Blender's main thread.
- **`pyproject.toml`** — packaging, so the server can run via `uvx`/`uv`.

There are **two ways** to wire this up. The repo's `.claude/settings.json` is
preconfigured with both — pick one.

---

## Option A — Community package (zero local files)

Uses the published [`blender-mcp`](https://github.com/ahujasid/blender-mcp)
package. This is the `blender` entry in `.claude/settings.json`:

```json
"blender": { "command": "uvx", "args": ["blender-mcp"] }
```

You still need the Blender add-on from that project installed and its server
started (see their README).

## Option B — This repo's self-contained server

Uses `server.py` + `addon.py` from this folder. This is the
`blender-local` entry in `.claude/settings.json`:

```json
"blender-local": { "command": "uvx", "args": ["--from", "./blender-mcp", "blender-mcp-local"] }
```

---

## Setup (Option B)

### 1. Install prerequisites

- **Blender 3.0+**
- **[uv](https://docs.astral.sh/uv/)** — `curl -LsSf https://astral.sh/uv/install.sh | sh`

### 2. Install the Blender add-on

1. Open Blender → **Edit ▸ Preferences ▸ Add-ons ▸ Install…**
2. Select `blender-mcp/addon.py` from this repo.
3. Tick **Interface: Blender MCP** to enable it.

### 3. Start the socket server in Blender

1. In the 3D viewport press **`N`** to open the sidebar.
2. Open the **BlenderMCP** tab.
3. (Optional) adjust host/port — default `localhost:9876`.
4. Click **Start MCP Server**. You should see "Server running".

### 4. Connect your MCP client

When you open **Claude Code locally** in this repo, it reads
`.claude/settings.json` and launches the `blender-local` server automatically.
Verify with `/mcp` — `blender-local` should show as connected.

> **Note:** This only works in a **local** Claude Code session, because the
> server connects to Blender on `localhost`. It cannot work from the web /
> remote environment.

For **Claude Desktop**, add to its `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "blender-local": {
      "command": "uvx",
      "args": ["--from", "/absolute/path/to/blender-mcp", "blender-mcp-local"]
    }
  }
}
```

---

## Configuration

The server reads these environment variables (all optional):

| Variable              | Default     | Purpose                          |
| --------------------- | ----------- | -------------------------------- |
| `BLENDER_MCP_HOST`    | `localhost` | Host where Blender's add-on runs |
| `BLENDER_MCP_PORT`    | `9876`      | Port the add-on listens on       |
| `BLENDER_MCP_TIMEOUT` | `60`        | Socket timeout in seconds        |

---

## Available tools

| Tool              | Description                                              |
| ----------------- | ------------------------------------------------------- |
| `get_scene_info`  | Scene summary: frame range, engine, object list.        |
| `get_object_info` | Transform, dimensions, materials, mesh stats by name.   |
| `create_object`   | Add a primitive (cube, sphere, camera, light, …).       |
| `modify_object`   | Change an object's transform or visibility.             |
| `delete_object`   | Remove an object by name.                               |
| `set_material`    | Create/assign a material with an optional base color.   |
| `render_scene`    | Render to an image file at an optional resolution.      |
| `execute_code`    | Run arbitrary Python in Blender (assign `result`).      |

---

## Security note

`execute_code` runs **unsandboxed** inside Blender with full access to `bpy`
and the host filesystem. The socket also accepts connections from anything that
can reach the port. Keep it bound to `localhost` and only run code you trust.

---

## Troubleshooting

- **"Could not reach Blender …"** — Blender isn't running, the add-on server
  isn't started, or the port differs. Start the server in the BlenderMCP panel
  and confirm the port matches.
- **Client shows the server failed to launch** — make sure `uv` is installed
  and on your `PATH`, and that the `--from` path points at this `blender-mcp`
  folder.
- **Port already in use** — change the port in the BlenderMCP panel and set
  `BLENDER_MCP_PORT` to match in your client config.
