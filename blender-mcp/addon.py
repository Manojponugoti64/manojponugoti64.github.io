"""BlenderMCP add-on — socket server that runs inside Blender.

Install this file as a Blender add-on (Edit > Preferences > Add-ons > Install),
enable "Interface: Blender MCP", then open the 3D viewport sidebar (press N),
find the "BlenderMCP" tab, and click "Start MCP Server".

It listens on a TCP socket (default localhost:9876) for newline-free JSON
commands of the form::

    {"type": "<command>", "params": {...}}

and replies with::

    {"status": "success", "result": {...}}      # or
    {"status": "error", "message": "..."}

Commands are dispatched on Blender's main thread via a timer, because ``bpy``
is not thread-safe and must not be touched from the socket thread directly.
"""

import json
import queue
import socket
import threading
import traceback

import bpy
import mathutils

bl_info = {
    "name": "Blender MCP",
    "author": "manojponugoti64",
    "version": (1, 0, 0),
    "blender": (3, 0, 0),
    "location": "View3D > Sidebar > BlenderMCP",
    "description": "Model Context Protocol server: drive Blender from an MCP client.",
    "category": "Interface",
}

DEFAULT_HOST = "localhost"
DEFAULT_PORT = 9876

# A single global server instance, referenced by the operators / UI.
_server = None


class BlenderMCPServer:
    """Threaded TCP server that hands work to Blender's main thread."""

    def __init__(self, host=DEFAULT_HOST, port=DEFAULT_PORT):
        self.host = host
        self.port = port
        self.running = False
        self._sock = None
        self._thread = None
        # (command_dict, response_queue) pairs awaiting main-thread execution.
        self._jobs = queue.Queue()

    # -- lifecycle ---------------------------------------------------------- #

    def start(self):
        if self.running:
            return
        self.running = True
        self._sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self._sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        self._sock.bind((self.host, self.port))
        self._sock.listen(5)
        self._sock.settimeout(1.0)

        self._thread = threading.Thread(target=self._accept_loop, daemon=True)
        self._thread.start()

        # Drain queued jobs on the main thread, ~20x/second.
        bpy.app.timers.register(self._process_jobs, persistent=True)
        print(f"[BlenderMCP] listening on {self.host}:{self.port}")

    def stop(self):
        self.running = False
        if self._sock:
            try:
                self._sock.close()
            except OSError:
                pass
            self._sock = None
        if bpy.app.timers.is_registered(self._process_jobs):
            bpy.app.timers.unregister(self._process_jobs)
        print("[BlenderMCP] stopped")

    # -- socket thread ------------------------------------------------------ #

    def _accept_loop(self):
        while self.running:
            try:
                client, _addr = self._sock.accept()
            except socket.timeout:
                continue
            except OSError:
                break
            threading.Thread(target=self._handle_client, args=(client,), daemon=True).start()

    def _handle_client(self, client):
        client.settimeout(60.0)
        with client:
            chunks = []
            while True:
                try:
                    chunk = client.recv(8192)
                except socket.timeout:
                    return
                if not chunk:
                    break
                chunks.append(chunk)
                try:
                    command = json.loads(b"".join(chunks).decode("utf-8"))
                except json.JSONDecodeError:
                    continue  # wait for the rest of the payload
                break

            try:
                command = json.loads(b"".join(chunks).decode("utf-8"))
            except (json.JSONDecodeError, UnicodeDecodeError) as exc:
                self._reply(client, {"status": "error", "message": f"bad request: {exc}"})
                return

            # Hand the command to the main thread and wait for its result.
            response_q = queue.Queue()
            self._jobs.put((command, response_q))
            try:
                response = response_q.get(timeout=120)
            except queue.Empty:
                response = {"status": "error", "message": "timed out waiting for Blender main thread"}
            self._reply(client, response)

    @staticmethod
    def _reply(client, response):
        try:
            client.sendall(json.dumps(response, default=str).encode("utf-8"))
        except OSError:
            pass

    # -- main thread -------------------------------------------------------- #

    def _process_jobs(self):
        """Timer callback: execute queued commands on Blender's main thread."""
        while not self._jobs.empty():
            command, response_q = self._jobs.get_nowait()
            response_q.put(self._dispatch(command))
        return 0.05 if self.running else None

    def _dispatch(self, command):
        handler = _HANDLERS.get(command.get("type"))
        if handler is None:
            return {"status": "error", "message": f"unknown command: {command.get('type')!r}"}
        try:
            return {"status": "success", "result": handler(command.get("params") or {})}
        except Exception as exc:  # noqa: BLE001 - report any handler failure back to the client
            return {"status": "error", "message": f"{exc}\n{traceback.format_exc()}"}


# --------------------------------------------------------------------------- #
# Command handlers — each runs on the main thread and returns JSON-able data.
# --------------------------------------------------------------------------- #


def _handle_get_scene_info(_params):
    scene = bpy.context.scene
    return {
        "name": scene.name,
        "frame_current": scene.frame_current,
        "frame_start": scene.frame_start,
        "frame_end": scene.frame_end,
        "engine": scene.render.engine,
        "object_count": len(scene.objects),
        "objects": [
            {
                "name": obj.name,
                "type": obj.type,
                "location": list(obj.location),
            }
            for obj in scene.objects
        ],
    }


def _handle_get_object_info(params):
    obj = bpy.data.objects.get(params["name"])
    if obj is None:
        raise ValueError(f"no object named {params['name']!r}")
    info = {
        "name": obj.name,
        "type": obj.type,
        "location": list(obj.location),
        "rotation_euler": list(obj.rotation_euler),
        "scale": list(obj.scale),
        "dimensions": list(obj.dimensions),
        "visible": obj.visible_get(),
        "materials": [slot.material.name for slot in obj.material_slots if slot.material],
    }
    if obj.type == "MESH":
        mesh = obj.data
        info["mesh"] = {
            "vertices": len(mesh.vertices),
            "edges": len(mesh.edges),
            "polygons": len(mesh.polygons),
        }
    return info


_PRIMITIVE_OPS = {
    "CUBE": lambda: bpy.ops.mesh.primitive_cube_add(),
    "SPHERE": lambda: bpy.ops.mesh.primitive_uv_sphere_add(),
    "CYLINDER": lambda: bpy.ops.mesh.primitive_cylinder_add(),
    "CONE": lambda: bpy.ops.mesh.primitive_cone_add(),
    "PLANE": lambda: bpy.ops.mesh.primitive_plane_add(),
    "TORUS": lambda: bpy.ops.mesh.primitive_torus_add(),
    "MONKEY": lambda: bpy.ops.mesh.primitive_monkey_add(),
    "EMPTY": lambda: bpy.ops.object.empty_add(),
    "CAMERA": lambda: bpy.ops.object.camera_add(),
    "LIGHT": lambda: bpy.ops.object.light_add(),
}


def _handle_create_object(params):
    obj_type = params.get("type", "CUBE").upper()
    op = _PRIMITIVE_OPS.get(obj_type)
    if op is None:
        raise ValueError(f"unsupported object type: {obj_type!r}")
    op()
    obj = bpy.context.active_object
    if params.get("name"):
        obj.name = params["name"]
    if params.get("location") is not None:
        obj.location = mathutils.Vector(params["location"])
    if params.get("rotation") is not None:
        obj.rotation_euler = mathutils.Euler(params["rotation"])
    if params.get("scale") is not None:
        obj.scale = mathutils.Vector(params["scale"])
    return {"name": obj.name, "type": obj.type, "location": list(obj.location)}


def _handle_modify_object(params):
    obj = bpy.data.objects.get(params["name"])
    if obj is None:
        raise ValueError(f"no object named {params['name']!r}")
    if params.get("location") is not None:
        obj.location = mathutils.Vector(params["location"])
    if params.get("rotation") is not None:
        obj.rotation_euler = mathutils.Euler(params["rotation"])
    if params.get("scale") is not None:
        obj.scale = mathutils.Vector(params["scale"])
    if params.get("visible") is not None:
        obj.hide_set(not params["visible"])
    return {"name": obj.name, "location": list(obj.location)}


def _handle_delete_object(params):
    obj = bpy.data.objects.get(params["name"])
    if obj is None:
        raise ValueError(f"no object named {params['name']!r}")
    name = obj.name
    bpy.data.objects.remove(obj, do_unlink=True)
    return {"deleted": name}


def _handle_set_material(params):
    obj = bpy.data.objects.get(params["object_name"])
    if obj is None:
        raise ValueError(f"no object named {params['object_name']!r}")

    mat_name = params.get("material_name") or f"{obj.name}_material"
    mat = bpy.data.materials.get(mat_name) or bpy.data.materials.new(name=mat_name)
    mat.use_nodes = True

    if params.get("color") is not None:
        color = list(params["color"])
        if len(color) == 3:
            color.append(1.0)
        bsdf = mat.node_tree.nodes.get("Principled BSDF")
        if bsdf:
            bsdf.inputs["Base Color"].default_value = color

    if obj.data.materials:
        obj.data.materials[0] = mat
    else:
        obj.data.materials.append(mat)
    return {"object": obj.name, "material": mat.name}


def _handle_render_scene(params):
    scene = bpy.context.scene
    if params.get("resolution_x") is not None:
        scene.render.resolution_x = int(params["resolution_x"])
    if params.get("resolution_y") is not None:
        scene.render.resolution_y = int(params["resolution_y"])
    if params.get("output_path"):
        scene.render.filepath = params["output_path"]
    bpy.ops.render.render(write_still=True)
    return {"rendered_to": scene.render.filepath}


def _handle_execute_code(params):
    code = params.get("code", "")
    namespace = {"bpy": bpy, "mathutils": mathutils}
    exec(code, namespace)  # noqa: S102 - intentional: arbitrary Blender scripting
    result = namespace.get("result")
    return {"executed": True, "result": result}


_HANDLERS = {
    "get_scene_info": _handle_get_scene_info,
    "get_object_info": _handle_get_object_info,
    "create_object": _handle_create_object,
    "modify_object": _handle_modify_object,
    "delete_object": _handle_delete_object,
    "set_material": _handle_set_material,
    "render_scene": _handle_render_scene,
    "execute_code": _handle_execute_code,
}


# --------------------------------------------------------------------------- #
# Blender UI: properties, operators, panel
# --------------------------------------------------------------------------- #


class BlenderMCPStartOperator(bpy.types.Operator):
    bl_idname = "blendermcp.start_server"
    bl_label = "Start MCP Server"
    bl_description = "Start the Blender MCP socket server"

    def execute(self, context):
        global _server
        if _server is None:
            _server = BlenderMCPServer(
                host=context.scene.blendermcp_host,
                port=context.scene.blendermcp_port,
            )
        try:
            _server.start()
        except OSError as exc:
            self.report({"ERROR"}, f"Could not start server: {exc}")
            return {"CANCELLED"}
        context.scene.blendermcp_running = True
        self.report({"INFO"}, f"BlenderMCP listening on port {_server.port}")
        return {"FINISHED"}


class BlenderMCPStopOperator(bpy.types.Operator):
    bl_idname = "blendermcp.stop_server"
    bl_label = "Stop MCP Server"
    bl_description = "Stop the Blender MCP socket server"

    def execute(self, context):
        global _server
        if _server is not None:
            _server.stop()
        context.scene.blendermcp_running = False
        self.report({"INFO"}, "BlenderMCP stopped")
        return {"FINISHED"}


class BlenderMCPPanel(bpy.types.Panel):
    bl_label = "Blender MCP"
    bl_idname = "VIEW3D_PT_blendermcp"
    bl_space_type = "VIEW_3D"
    bl_region_type = "UI"
    bl_category = "BlenderMCP"

    def draw(self, context):
        layout = self.layout
        scene = context.scene
        layout.prop(scene, "blendermcp_host")
        layout.prop(scene, "blendermcp_port")
        if scene.blendermcp_running:
            layout.operator("blendermcp.stop_server", icon="PAUSE")
            layout.label(text="Server running", icon="CHECKMARK")
        else:
            layout.operator("blendermcp.start_server", icon="PLAY")


_CLASSES = (
    BlenderMCPStartOperator,
    BlenderMCPStopOperator,
    BlenderMCPPanel,
)


def register():
    bpy.types.Scene.blendermcp_host = bpy.props.StringProperty(
        name="Host", default=DEFAULT_HOST
    )
    bpy.types.Scene.blendermcp_port = bpy.props.IntProperty(
        name="Port", default=DEFAULT_PORT, min=1024, max=65535
    )
    bpy.types.Scene.blendermcp_running = bpy.props.BoolProperty(
        name="Running", default=False
    )
    for cls in _CLASSES:
        bpy.utils.register_class(cls)


def unregister():
    global _server
    if _server is not None:
        _server.stop()
        _server = None
    for cls in reversed(_CLASSES):
        bpy.utils.unregister_class(cls)
    del bpy.types.Scene.blendermcp_host
    del bpy.types.Scene.blendermcp_port
    del bpy.types.Scene.blendermcp_running


if __name__ == "__main__":
    register()
