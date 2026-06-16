"""Self-contained Blender MCP server.

A Model Context Protocol (MCP) server that lets an MCP client (Claude Code,
Claude Desktop, etc.) drive a running Blender instance. It talks to the
companion Blender add-on (``addon.py``) over a small TCP/JSON socket protocol.

Architecture::

    MCP client  <--stdio/MCP-->  server.py  <--TCP/JSON-->  Blender add-on

The add-on opens a socket inside Blender (default ``localhost:9876``) and runs
each incoming command on Blender's main thread. This file is the MCP side: it
exposes a set of tools, and each tool forwards a JSON command to the add-on and
returns the result.

Run directly with ``uv``::

    uvx --from . blender-mcp-local

or via the entry point declared in ``pyproject.toml``.
"""

from __future__ import annotations

import json
import os
import socket
from contextlib import closing
from typing import Any

from mcp.server.fastmcp import FastMCP

# Connection settings (overridable via environment variables so the same
# server works against a remote Blender or a non-default port).
BLENDER_HOST = os.environ.get("BLENDER_MCP_HOST", "localhost")
BLENDER_PORT = int(os.environ.get("BLENDER_MCP_PORT", "9876"))
# Generous default: a render or heavy script can take a while.
SOCKET_TIMEOUT = float(os.environ.get("BLENDER_MCP_TIMEOUT", "60"))

mcp = FastMCP("blender")


class BlenderConnectionError(RuntimeError):
    """Raised when the add-on cannot be reached or returns a transport error."""


def _send_command(command_type: str, params: dict[str, Any] | None = None) -> dict[str, Any]:
    """Send one command to the Blender add-on and return its parsed response.

    Opens a fresh connection per call. This keeps the server stateless and
    avoids holding a socket open across the (potentially long) gaps between
    MCP tool invocations.
    """
    payload = json.dumps({"type": command_type, "params": params or {}}).encode("utf-8")

    try:
        with closing(socket.create_connection((BLENDER_HOST, BLENDER_PORT), SOCKET_TIMEOUT)) as sock:
            sock.settimeout(SOCKET_TIMEOUT)
            sock.sendall(payload)

            # The add-on replies with a single JSON object. Read until the
            # socket is closed or we have a complete, parseable document.
            chunks: list[bytes] = []
            while True:
                chunk = sock.recv(8192)
                if not chunk:
                    break
                chunks.append(chunk)
                try:
                    return json.loads(b"".join(chunks).decode("utf-8"))
                except json.JSONDecodeError:
                    # Partial payload — keep reading.
                    continue
    except (ConnectionRefusedError, socket.timeout, OSError) as exc:
        raise BlenderConnectionError(
            f"Could not reach Blender at {BLENDER_HOST}:{BLENDER_PORT}. "
            "Is Blender running with the BlenderMCP add-on server started? "
            f"({exc})"
        ) from exc

    # Socket closed before a full JSON document arrived.
    raw = b"".join(chunks).decode("utf-8", errors="replace")
    try:
        return json.loads(raw)
    except json.JSONDecodeError as exc:
        raise BlenderConnectionError(f"Malformed response from Blender add-on: {raw!r}") from exc


def _call(command_type: str, params: dict[str, Any] | None = None) -> str:
    """Run a command and render the result as a human/agent-readable string."""
    try:
        response = _send_command(command_type, params)
    except BlenderConnectionError as exc:
        return f"ERROR: {exc}"

    if response.get("status") == "error":
        return f"ERROR: {response.get('message', 'unknown error from Blender')}"

    result = response.get("result", response)
    return json.dumps(result, indent=2, default=str)


# --------------------------------------------------------------------------- #
# Tools
# --------------------------------------------------------------------------- #


@mcp.tool()
def get_scene_info() -> str:
    """Get a summary of the current Blender scene.

    Returns the scene name, frame range, render engine, and a list of every
    object with its type and world-space location.
    """
    return _call("get_scene_info")


@mcp.tool()
def get_object_info(name: str) -> str:
    """Get detailed information about one object by name.

    Includes transform (location, rotation, scale), dimensions, the assigned
    materials, and mesh stats (vertex/edge/face counts) when applicable.
    """
    return _call("get_object_info", {"name": name})


@mcp.tool()
def create_object(
    type: str = "CUBE",
    name: str | None = None,
    location: list[float] | None = None,
    rotation: list[float] | None = None,
    scale: list[float] | None = None,
) -> str:
    """Create a primitive object in the scene.

    Args:
        type: One of CUBE, SPHERE, CYLINDER, CONE, PLANE, TORUS, MONKEY,
            EMPTY, CAMERA, LIGHT.
        name: Optional name to assign to the new object.
        location: [x, y, z] world position. Defaults to the origin.
        rotation: [x, y, z] Euler rotation in radians.
        scale: [x, y, z] scale factors.
    """
    params: dict[str, Any] = {"type": type}
    if name is not None:
        params["name"] = name
    if location is not None:
        params["location"] = location
    if rotation is not None:
        params["rotation"] = rotation
    if scale is not None:
        params["scale"] = scale
    return _call("create_object", params)


@mcp.tool()
def modify_object(
    name: str,
    location: list[float] | None = None,
    rotation: list[float] | None = None,
    scale: list[float] | None = None,
    visible: bool | None = None,
) -> str:
    """Modify an existing object's transform or visibility.

    Only the provided fields are changed; omit anything you want to leave alone.
    """
    params: dict[str, Any] = {"name": name}
    if location is not None:
        params["location"] = location
    if rotation is not None:
        params["rotation"] = rotation
    if scale is not None:
        params["scale"] = scale
    if visible is not None:
        params["visible"] = visible
    return _call("modify_object", params)


@mcp.tool()
def delete_object(name: str) -> str:
    """Delete an object from the scene by name."""
    return _call("delete_object", {"name": name})


@mcp.tool()
def set_material(
    object_name: str,
    material_name: str | None = None,
    color: list[float] | None = None,
) -> str:
    """Assign a material to an object, creating it if needed.

    Args:
        object_name: The object to apply the material to.
        material_name: Name of the material to use or create.
        color: [r, g, b] or [r, g, b, a] in the 0..1 range for the base color.
    """
    params: dict[str, Any] = {"object_name": object_name}
    if material_name is not None:
        params["material_name"] = material_name
    if color is not None:
        params["color"] = color
    return _call("set_material", params)


@mcp.tool()
def render_scene(output_path: str | None = None, resolution_x: int | None = None,
                 resolution_y: int | None = None) -> str:
    """Render the current scene to an image file.

    Args:
        output_path: Where to save the render. Defaults to Blender's configured
            output path.
        resolution_x: Optional override for horizontal resolution in pixels.
        resolution_y: Optional override for vertical resolution in pixels.
    """
    params: dict[str, Any] = {}
    if output_path is not None:
        params["output_path"] = output_path
    if resolution_x is not None:
        params["resolution_x"] = resolution_x
    if resolution_y is not None:
        params["resolution_y"] = resolution_y
    return _call("render_scene", params)


@mcp.tool()
def execute_code(code: str) -> str:
    """Execute arbitrary Python code inside Blender.

    The code runs in Blender's Python environment with ``bpy`` available. Use
    this for anything the dedicated tools don't cover. To return data, assign
    it to a variable named ``result`` — its value is serialized and returned.

    WARNING: This runs unsandboxed inside Blender with full access to ``bpy``
    and the host filesystem. Only run code you trust.
    """
    return _call("execute_code", {"code": code})


def main() -> None:
    """Console-script / module entry point."""
    mcp.run()


if __name__ == "__main__":
    main()
