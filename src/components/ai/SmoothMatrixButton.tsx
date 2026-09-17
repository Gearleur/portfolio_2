import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';
import './smoothMatrixButton.css';

/**
 * Adapted from Eduardo Calvo's SmoothUI SmoothButton (MIT):
 * https://smoothui.dev/r/smooth-button.json
 *
 * Uses the upstream outline variant, pill shape, focus treatment and .97 press.
 * The upstream Tailwind/cva classes are translated into plain CSS; separate
 * anchor/button exports replace Radix Slot. Loading and Safari force-press
 * features are omitted because these controls do not need them.
 * See SmoothUI.LICENSE.md.
 */
type MatrixTone = 'orange' | 'blue';

export type SmoothMatrixButtonProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  tone?: MatrixTone;
  children: ReactNode;
};

function ButtonContents({ children }: { children: ReactNode }) {
  return (
    <>
      <span className="smooth-matrix-button__label">{children}</span>
    </>
  );
}

export function SmoothMatrixButton({
  className = '',
  tone = 'orange',
  children,
  target,
  rel,
  ...props
}: SmoothMatrixButtonProps) {
  return (
    <a
      className={`smooth-matrix-button smooth-matrix-button--${tone} ${className}`.trim()}
      target={target}
      rel={rel ?? (target === '_blank' ? 'noopener noreferrer' : undefined)}
      {...props}
    >
      <ButtonContents>{children}</ButtonContents>
    </a>
  );
}

export type SmoothActionButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: MatrixTone;
  children: ReactNode;
};

export function SmoothActionButton({
  className = '',
  tone = 'orange',
  children,
  type = 'button',
  ...props
}: SmoothActionButtonProps) {
  return (
    <button
      className={`smooth-matrix-button smooth-matrix-button--${tone} ${className}`.trim()}
      type={type}
      {...props}
    >
      <ButtonContents>{children}</ButtonContents>
    </button>
  );
}
