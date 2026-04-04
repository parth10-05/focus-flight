import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export default function MonoStatRow({ label, value }) {
    return (_jsxs("div", { className: "flex justify-between items-center py-2 border-b border-white/5 last:border-b-0", children: [_jsx("span", { className: "label-font text-[10px] uppercase text-secondary", children: label }), _jsx("span", { className: "technical-font text-[10px]", children: value })] }));
}
