import { jsx as _jsx } from "react/jsx-runtime";
export default function Panel({ elevated = false, children }) {
    return (_jsx("section", { className: ["rounded-standard", elevated ? "bg-elevated" : "bg-surface"].join(" "), children: children }));
}
