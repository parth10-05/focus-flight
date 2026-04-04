interface BlockedSiteTagProps {
  site: string;
}

export default function BlockedSiteTag({ site }: BlockedSiteTagProps): JSX.Element {
  return <span className="px-2 py-1 bg-secondary-container/30 border border-secondary/20 font-mono text-[10px] text-secondary">{site}</span>;
}
