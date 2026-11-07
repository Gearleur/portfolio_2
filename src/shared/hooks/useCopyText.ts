import { useEffect, useRef, useState } from 'react';

export type CopyState = 'idle' | 'copied' | 'error';

async function writeToClipboard(text: string) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      // Clipboard permissions can be unavailable outside a secure context.
    }
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();

  try {
    if (!document.execCommand('copy')) {
      throw new Error('Clipboard copy failed');
    }
  } finally {
    textarea.remove();
  }
}

export function useCopyText(resetDelay = 1800) {
  const [state, setState] = useState<CopyState>('idle');
  const resetTimer = useRef<number | null>(null);

  useEffect(() => () => {
    if (resetTimer.current !== null) {
      window.clearTimeout(resetTimer.current);
    }
  }, []);

  const copy = async (text: string) => {
    if (resetTimer.current !== null) {
      window.clearTimeout(resetTimer.current);
    }

    try {
      await writeToClipboard(text);
      setState('copied');
    } catch {
      setState('error');
    }

    resetTimer.current = window.setTimeout(() => setState('idle'), resetDelay);
  };

  return { copy, state };
}
