import { Link } from "react-router-dom";

interface SideNavItemProps {
  icon: string;
  label: string;
  to: string;
  active?: boolean;
}

export default function SideNavItem({ icon, label, to, active = false }: SideNavItemProps): JSX.Element {
  return (
    <Link
      className={active
        ? "flex items-center gap-3 p-3 bg-[#1a1c1e] text-[#c1c7ce] font-medium border-l-2 border-[#c1c7ce] linear transition-all duration-150"
        : "flex items-center gap-3 p-3 text-[#939eb4] hover:bg-[#1a1c1e] hover:text-[#c1c7ce] transition-all duration-150"}
      to={to}
    >
      <span className="material-symbols-outlined text-sm">{icon}</span>
      <span className="font-light tracking-[0.05em] text-xs uppercase">{label}</span>
    </Link>
  );
}
