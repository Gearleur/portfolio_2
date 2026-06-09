import { useRef } from 'react';
import type { PointerEvent, ReactNode } from 'react';
import type { WindowFrame, WindowInteraction } from '../../types/window';
import { clampFrameToDesktop, getDesktopBounds } from '../../utils/windowFrame';
import './retroWindow.css';

type RetroWindowProps = {
  ariaLabel: string;
  bodyClassName?: string;
  children: ReactNode;
  frame: WindowFrame;
  isMaximized: boolean;
  onClose: () => void;
  onFrameChange: (frame: WindowFrame) => void;
  onMinimize: () => void;
  onToggleMaximize: () => void;
  onActivate: () => void;
  title: string;
  zIndex: number;
};

export function RetroWindow({
  ariaLabel,
  bodyClassName,
  children,
  frame,
  isMaximized,
  onClose,
  onFrameChange,
  onMinimize,
  onToggleMaximize,
  onActivate,
  title,
  zIndex,
}: RetroWindowProps) {
  const interactionRef = useRef<WindowInteraction | null>(null);

  const beginDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || isMaximized) {
      return;
    }

    const windowElement = event.currentTarget.parentElement;
    if (!windowElement) {
      return;
    }

    const rect = windowElement.getBoundingClientRect();
    event.currentTarget.setPointerCapture(event.pointerId);
    interactionRef.current = {
      type: 'drag',
      pointerId: event.pointerId,
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
    };
  };

  const moveWindow = (event: PointerEvent<HTMLElement>) => {
    const interaction = interactionRef.current;
    if (!interaction || interaction.pointerId !== event.pointerId) {
      return;
    }

    const desktop = event.currentTarget.closest('.desktop-surface');
    if (!(desktop instanceof HTMLElement)) {
      return;
    }

    const bounds = getDesktopBounds(desktop);

    if (interaction.type === 'drag') {
      onFrameChange(
        clampFrameToDesktop(
          {
            ...frame,
            x: event.clientX - bounds.left + bounds.scrollLeft - interaction.offsetX,
            y: event.clientY - bounds.top + bounds.scrollTop - interaction.offsetY,
          },
          desktop,
        ),
      );
      return;
    }

    onFrameChange(
      clampFrameToDesktop(
        {
          ...interaction.startFrame,
          width: interaction.startFrame.width + event.clientX - interaction.startX,
          height: interaction.startFrame.height + event.clientY - interaction.startY,
        },
        desktop,
      ),
    );
  };

  const endInteraction = (event: PointerEvent<HTMLElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    interactionRef.current = null;
  };

  const beginResize = (event: PointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0 || isMaximized) {
      return;
    }

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    interactionRef.current = {
      type: 'resize',
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startFrame: frame,
    };
  };

  return (
    <section
      className={`retro-window${isMaximized ? ' retro-window--maximized' : ''}`}
      style={{ left: frame.x, top: frame.y, width: frame.width, height: frame.height, zIndex }}
      aria-label={ariaLabel}
      onFocusCapture={onActivate}
      onPointerDownCapture={onActivate}
    >
      <div
        className="retro-window__bar"
        onPointerDown={beginDrag}
        onPointerMove={moveWindow}
        onPointerUp={endInteraction}
        onPointerCancel={endInteraction}
      >
        <span className="retro-window__title">{title}</span>
        <div
          className="window-controls"
          onPointerDown={(event) => event.stopPropagation()}
          aria-label="Controles de la fenetre"
        >
          <button
            className="window-control window-control--minimize"
            type="button"
            onClick={onMinimize}
            onPointerDown={(event) => event.stopPropagation()}
            aria-label="Reduire la fenetre"
          />
          <button
            className={`window-control ${
              isMaximized ? 'window-control--restore' : 'window-control--maximize'
            }`}
            type="button"
            onClick={onToggleMaximize}
            onPointerDown={(event) => event.stopPropagation()}
            aria-label={isMaximized ? 'Restaurer la fenetre' : 'Agrandir la fenetre'}
          />
          <button
            className="window-control window-control--close"
            type="button"
            onClick={onClose}
            onPointerDown={(event) => event.stopPropagation()}
            aria-label="Fermer la fenetre"
          />
        </div>
      </div>

      <div className={`retro-window__body${bodyClassName ? ` ${bodyClassName}` : ''}`}>
        {children}
      </div>

      <button
        className="window-resize-handle"
        type="button"
        onPointerDown={beginResize}
        onPointerMove={moveWindow}
        onPointerUp={endInteraction}
        onPointerCancel={endInteraction}
        aria-label="Redimensionner la fenetre"
      />
    </section>
  );
}
