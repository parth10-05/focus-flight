import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export default function StatusDotLabel({ label, pulsing = false }) {
    return (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: `w-2 h-2 rounded-full bg-primary/20 ${pulsing ? "animate-pulse" : ""}` }), _jsx("span", { className: "font-mono text-[10px] tracking-widest text-secondary uppercase", children: label })] }));
}
