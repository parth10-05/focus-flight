import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export default function OverlayMetric({ label, value }) {
    return (_jsxs("div", { className: "text-right", children: [_jsx("p", { className: "font-label text-[9px] tracking-[0.2em] text-secondary uppercase mb-1", children: label }), _jsx("p", { className: "font-mono text-xl text-primary leading-none", children: value })] }));
}
