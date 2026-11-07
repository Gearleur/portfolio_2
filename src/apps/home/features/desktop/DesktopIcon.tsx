type DesktopIconContentProps = {
  iconSrc: string;
  label: string;
};

type DesktopButtonIconProps = DesktopIconContentProps & {
  className: string;
  onClick: () => void;
};

type DesktopLinkIconProps = DesktopIconContentProps & {
  className: string;
  href: string;
};

type DesktopStaticIconProps = DesktopIconContentProps & {
  ariaLabel: string;
  className: string;
};

function DesktopIconContent({ iconSrc, label }: DesktopIconContentProps) {
  return (
    <>
      <img className="desktop-file__icon" src={iconSrc} alt="" aria-hidden="true" />
      <span className="desktop-file__label">{label}</span>
    </>
  );
}

export function DesktopButtonIcon({ className, iconSrc, label, onClick }: DesktopButtonIconProps) {
  return (
    <button className={`desktop-file ${className}`} type="button" onClick={onClick}>
      <DesktopIconContent iconSrc={iconSrc} label={label} />
    </button>
  );
}

export function DesktopLinkIcon({ className, href, iconSrc, label }: DesktopLinkIconProps) {
  const isExternalUrl = href.startsWith('http');

  return (
    <a
      className={`desktop-file ${className}`}
      href={href}
      rel={isExternalUrl ? 'noreferrer' : undefined}
      target={isExternalUrl ? '_blank' : undefined}
      aria-label={label}
    >
      <DesktopIconContent iconSrc={iconSrc} label={label} />
    </a>
  );
}

export function DesktopStaticIcon({
  ariaLabel,
  className,
  iconSrc,
  label,
}: DesktopStaticIconProps) {
  return (
    <div className={`desktop-file ${className}`} role="img" aria-label={ariaLabel}>
      <DesktopIconContent iconSrc={iconSrc} label={label} />
    </div>
  );
}
