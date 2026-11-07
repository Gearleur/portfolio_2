import type { ButtonHTMLAttributes, ReactNode } from 'react';
import './smoothMatrixButton.css';

/**
 * Adapted from Eduardo Calvo's SmoothUI SmoothButton (MIT):
 * https://smoothui.dev/r/smooth-button.json
 *
 * Uses the upstream outline variant, pill shape, focus treatment and .97 press.
 * The upstream Tailwind/cva classes are translated into plain CSS; separate
 * a button export replaces Radix Slot. Loading and Safari force-press
 * features are omitted because these controls do not need them.
 * See SmoothUI.LICENSE.md.
 */
type MatrixTone = 'orange' | 'blue';

function ButtonContents({ children }: { children: ReactNode }) {
  return (
    <>
      <span className="smooth-matrix-button__label">{children}</span>
    </>
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
