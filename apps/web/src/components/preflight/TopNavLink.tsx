import { Link } from "react-router-dom";

interface TopNavLinkProps {
  label: string;
  to: string;
  active?: boolean;
}

export default function TopNavLink({ label, to, active = false }: TopNavLinkProps): JSX.Element {
  if (active) {
    return (
      <Link
        className="font-light tracking-[0.1em] text-sm uppercase text-[#c1c7ce] border-b-2 border-[#c1c7ce] pb-1 hover:text-[#e4ebff] transition-colors duration-150"
        to={to}
      >
        {label}
      </Link>
    );
  }

  return (
    <Link
      className="font-light tracking-[0.1em] text-sm uppercase text-[#939eb4] hover:text-[#e4ebff] transition-colors duration-150"
      to={to}
    >
      {label}
    </Link>
  );
}
