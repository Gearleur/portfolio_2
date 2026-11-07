import type { MobileApp } from './mobileApps';

type MobileIconProps = {
  app: MobileApp;
  onOpen?: () => void;
};

export function MobileIcon({ app, onOpen }: MobileIconProps) {
  const content = (
    <>
      <span className="mobile-app-icon__tile">
        <img
          src={app.iconSrc}
          alt=""
          aria-hidden="true"
          decoding="async"
          draggable={false}
          loading="eager"
        />
      </span>
      <span className="mobile-app-icon__label">{app.label}</span>
    </>
  );

  if (app.href) {
    const isExternalUrl = app.href.startsWith('http');

    return (
      <a
        className="mobile-app-icon"
        href={app.href}
        rel={isExternalUrl ? 'noreferrer' : undefined}
        target={isExternalUrl ? '_blank' : undefined}
        aria-label={app.label}
      >
        {content}
      </a>
    );
  }

  return (
    <button className="mobile-app-icon" type="button" onClick={onOpen} aria-label={app.label}>
      {content}
    </button>
  );
}
