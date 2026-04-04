import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export default function FooterMetric({ label, value, withPulse = false }) {
    return (_jsxs("div", { className: "space-y-1", children: [_jsx("div", { className: "text-[9px] font-label text-secondary tracking-widest uppercase", children: label }), withPulse ? (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-1.5 h-1.5 bg-primary rounded-full animate-pulse" }), _jsx("span", { className: "font-mono text-[10px] uppercase", children: value })] })) : (_jsx("div", { className: "font-mono text-[10px]", children: value }))] }));
}
