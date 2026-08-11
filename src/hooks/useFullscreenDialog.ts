import { useEffect } from 'react';
import type { RefObject } from 'react';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

type FullscreenDialogOptions = {
  backgroundSelector: string;
  enabled?: boolean;
  onClose: () => void;
  ref: RefObject<HTMLElement | null>;
};

export function useFullscreenDialog({
  backgroundSelector,
  enabled = true,
  onClose,
  ref,
}: FullscreenDialogOptions) {
  useEffect(() => {
    if (!enabled || !ref.current) {
      return;
    }

    const dialog = ref.current;
    const background = document.querySelector<HTMLElement>(backgroundSelector);
    const previouslyFocused = document.activeElement;
    const previousOverflow = document.body.style.overflow;

    background?.setAttribute('inert', '');
    document.body.style.overflow = 'hidden';
    dialog.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== 'Tab') {
        return;
      }

      const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
      if (focusable.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable.at(-1)!;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    dialog.addEventListener('keydown', handleKeyDown);
    return () => {
      dialog.removeEventListener('keydown', handleKeyDown);
      background?.removeAttribute('inert');
      document.body.style.overflow = previousOverflow;
      if (previouslyFocused instanceof HTMLElement && previouslyFocused.isConnected) {
        previouslyFocused.focus();
      }
    };
  }, [backgroundSelector, enabled, onClose, ref]);
}
