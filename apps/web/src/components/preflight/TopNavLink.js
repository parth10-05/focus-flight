import { jsx as _jsx } from "react/jsx-runtime";
import { Link } from "react-router-dom";
export default function TopNavLink({ label, to, active = false }) {
    if (active) {
        return (_jsx(Link, { className: "font-light tracking-[0.1em] text-sm uppercase text-[#c1c7ce] border-b-2 border-[#c1c7ce] pb-1 hover:text-[#e4ebff] transition-colors duration-150", to: to, children: label }));
    }
    return (_jsx(Link, { className: "font-light tracking-[0.1em] text-sm uppercase text-[#939eb4] hover:text-[#e4ebff] transition-colors duration-150", to: to, children: label }));
}
