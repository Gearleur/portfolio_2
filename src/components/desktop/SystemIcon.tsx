import type { SystemItem } from '../../data/systemItems';
import { DesktopButtonIcon, DesktopLinkIcon, DesktopStaticIcon } from './DesktopIcon';

type SystemIconProps = {
  item: SystemItem;
  onOpen?: () => void;
};

export function SystemIcon({ item, onOpen }: SystemIconProps) {
  const ariaLabel = item.isDecorative
    ? `${item.label}, element decoratif`
    : `${item.label}, section portfolio`;
  const className = `system-file system-file--${item.variant}${
    onOpen || item.href ? ' system-file--interactive' : ''
  }`;

  if (item.href) {
    return (
      <DesktopLinkIcon
        className={className}
        href={item.href}
        iconSrc={item.iconSrc}
        label={item.label}
      />
    );
  }

  if (onOpen) {
    return (
      <DesktopButtonIcon
        className={className}
        iconSrc={item.iconSrc}
        label={item.label}
        onClick={onOpen}
      />
    );
  }

  return (
    <DesktopStaticIcon
      ariaLabel={ariaLabel}
      className={className}
      iconSrc={item.iconSrc}
      label={item.label}
    />
  );
}
