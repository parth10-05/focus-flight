import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export default function TelemetryTile({ label, value }) {
    return (_jsxs("div", { className: "bg-surface-container-lowest p-4 border border-outline-variant/10", children: [_jsx("div", { className: "text-[9px] font-label text-secondary tracking-widest uppercase", children: label }), _jsx("div", { className: "font-mono text-sm text-on-surface", children: value })] }));
}
