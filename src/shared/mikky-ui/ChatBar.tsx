import type { CSSProperties } from 'react';
import { Icon } from './Icon';

/**
 * Mikky's prompt bar: a grey pill (text, mic, send), and under it, over its
 * edge, the folder and the model it runs on. `text` empty shows the placeholder.
 */
export function ChatBar({
  text,
  placeholder,
  caret = false,
  folder,
  model,
}: {
  text?: string;
  placeholder: string;
  caret?: boolean;
  folder?: string;
  model?: string;
}) {
  return (
    <div className="mk-bar-chat">
      <div className="mk-pill">
        <span className="mk-pill__text" data-vide={text ? undefined : ''}>
          {text || placeholder}
          {caret && <span className="mk-caret" />}
        </span>
        <Icon name="mic" />
        <span className="mk-round mk-round--ink mk-send">
          <Icon name="up" />
        </span>
      </div>
      {(folder || model) && (
        <div className="mk-chips">
          {folder && (
            <span className="mk-chip">
              <Icon name="folder" />
              {folder}
              <Icon name="down" />
            </span>
          )}
          {model && (
            <span className="mk-chip">
              <span className="mk-chip__logo" style={{ '--c': '#fa520f' } as CSSProperties}>
                <Icon name="sparkle" />
              </span>
              {model}
              <Icon name="down" />
            </span>
          )}
        </div>
      )}
    </div>
  );
}
