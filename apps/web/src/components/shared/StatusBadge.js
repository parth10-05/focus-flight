import { jsx as _jsx } from "react/jsx-runtime";
function toVariant(status) {
    const normalized = status.toLowerCase();
    if (normalized === "completed" || normalized === "complete") {
        return "bg-secondary-container text-on-secondary-container";
    }
    if (normalized === "aborted") {
        return "bg-error-container text-on-error-container";
    }
    return "bg-primary-container text-on-primary-container";
}
export default function StatusBadge({ status }) {
    return (_jsx("span", { className: `inline-block px-2 py-0.5 text-[9px] tracking-tighter uppercase ${toVariant(status)}`, children: status }));
}
