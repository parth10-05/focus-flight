import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export default function FooterTelemetryItem({ icon, label, active = false }) {
    return (_jsxs("div", { className: "flex items-center gap-1", children: [_jsx("span", { className: `material-symbols-outlined text-[14px] ${active ? "text-primary" : "text-secondary-dim"}`, children: icon }), _jsx("span", { className: `font-mono text-[10px] tracking-widest uppercase ${active ? "text-primary" : "text-secondary-dim"}`, children: label })] }));
}
