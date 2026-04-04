interface TopNavLinkProps {
  label: string;
  active?: boolean;
}

export default function TopNavLink({ label, active = false }: TopNavLinkProps): JSX.Element {
  if (active) {
    return (
      <a
        className="font-light tracking-[0.1em] text-sm uppercase text-[#c1c7ce] border-b-2 border-[#c1c7ce] pb-1 hover:text-[#e4ebff] transition-colors duration-150"
        href="#"
      >
        {label}
      </a>
    );
  }

  return (
    <a
      className="font-light tracking-[0.1em] text-sm uppercase text-[#939eb4] hover:text-[#e4ebff] transition-colors duration-150"
      href="#"
    >
      {label}
    </a>
  );
}
