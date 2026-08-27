/* WebMCP inspector: a dev-only panel for invoking registered tools by hand.
 * Gated on ?mcp=debug so ordinary visitors never see or load it.
 * Reads window.__webmcp.tools, so it works even where the browser ships no WebMCP.
 */
(function () {
    'use strict';

    if (new URLSearchParams(location.search).get('mcp') !== 'debug') return;

    function el(tag, cls, text) {
        var n = document.createElement(tag);
        if (cls) n.className = cls;
        if (text != null) n.textContent = text;
        return n;
    }

    function build() {
        var api = window.__webmcp;
        if (!api) return;

        var panel = el('div', 'mcp-panel');

        var head = el('div', 'mcp-head');
        head.appendChild(el('strong', null, 'WebMCP'));
        head.appendChild(el('span', 'mcp-badge',
            api.native ? 'native API present' : 'no native API — local registry'));
        var close = el('button', 'mcp-close', '×');
        close.title = 'Close';
        close.addEventListener('click', function () { panel.remove(); });
        head.appendChild(close);
        panel.appendChild(head);

        api.tools.forEach(function (tool) {
            var box = el('div', 'mcp-tool');

            var name = el('div', 'mcp-name');
            name.appendChild(el('code', null, tool.name));
            var ro = tool.annotations && tool.annotations.readOnlyHint;
            name.appendChild(el('span', 'mcp-tag ' + (ro ? 'ro' : 'rw'),
                ro ? 'read-only' : 'MUTATES'));
            box.appendChild(name);

            box.appendChild(el('div', 'mcp-desc', tool.description));

            var props = (tool.inputSchema && tool.inputSchema.properties) || {};
            var required = (tool.inputSchema && tool.inputSchema.required) || [];
            var inputs = {};

            Object.keys(props).forEach(function (key) {
                var spec = props[key];
                var row = el('label', 'mcp-row');
                row.appendChild(el('span', 'mcp-key',
                    key + (required.indexOf(key) !== -1 ? ' *' : '')));

                var field;
                if (spec.enum) {
                    field = el('select');
                    spec.enum.forEach(function (v) {
                        var o = el('option', null, v); o.value = v; field.appendChild(o);
                    });
                } else {
                    field = el('input');
                    field.type = spec.type === 'number' ? 'number' : 'text';
                    field.placeholder = spec.description || '';
                }
                inputs[key] = { field: field, type: spec.type };
                row.appendChild(field);
                box.appendChild(row);
            });

            var out = el('pre', 'mcp-out');
            var run = el('button', 'mcp-run', 'Run');

            run.addEventListener('click', function () {
                var payload = {};
                Object.keys(inputs).forEach(function (k) {
                    var v = inputs[k].field.value;
                    if (v === '') return;                       // omit, don't send ""
                    payload[k] = inputs[k].type === 'number' ? Number(v) : v;
                });
                out.textContent = '…';
                run.disabled = true;
                api.call(tool.name, payload).then(function (res) {
                    out.textContent = JSON.stringify(res, null, 2);
                    out.className = 'mcp-out' + (res && res.error ? ' err' : '');
                    run.disabled = false;
                });
            });

            box.appendChild(run);
            box.appendChild(out);
            panel.appendChild(box);
        });

        document.body.appendChild(panel);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', build);
    } else {
        build();
    }
})();
