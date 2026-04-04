import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export default function BlockedSectorChip({ label, onRemove }) {
    return (_jsxs("div", { className: "px-3 py-1 bg-secondary-container/30 border border-secondary/20 flex items-center gap-4", children: [_jsx("span", { className: "font-mono text-[10px] text-secondary", children: label }), _jsx("button", { type: "button", onClick: onRemove, "aria-label": `Remove ${label}`, children: _jsx("span", { className: "material-symbols-outlined text-[10px] text-primary cursor-pointer", children: "close" }) })] }));
}
