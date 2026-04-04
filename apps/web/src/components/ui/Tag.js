import { jsx as _jsx } from "react/jsx-runtime";
const variantClasses = {
    green: "bg-accent-green/20 text-accent-green",
    blue: "bg-accent-blue/20 text-accent-blue",
    amber: "bg-accent-amber/20 text-accent-amber",
    muted: "bg-text-muted/20 text-muted"
};
export default function Tag({ label, variant }) {
    return (_jsx("span", { className: [
            "inline-flex items-center rounded-small px-2 py-1 font-mono text-xs uppercase tracking-[0.08em]",
            variantClasses[variant]
        ].join(" "), children: label }));
}
