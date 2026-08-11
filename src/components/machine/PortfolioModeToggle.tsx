import { useLayoutEffect, useRef, useState } from 'react';
import type { PointerEvent } from 'react';

export type PortfolioMode = 'human' | 'machine';

type PortfolioModeToggleProps = {
  mode: PortfolioMode;
  onChange: (mode: PortfolioMode) => void;
};

export function PortfolioModeToggle({ mode, onChange }: PortfolioModeToggleProps) {
  const targetValue = mode === 'machine' ? 100 : 0;
  const [sliderValue, setSliderValue] = useState(targetValue);
  const dragRef = useRef({ active: false, startX: 0, startValue: targetValue });
  const sliderRef = useRef<HTMLLabelElement>(null);
  const thumbRef = useRef<HTMLSpanElement>(null);
  const valueRef = useRef(targetValue);
  const animationFrameRef = useRef<number | null>(null);

  const updateThumbPosition = (value: number) => {
    const slider = sliderRef.current;
    const thumb = thumbRef.current;
    if (!slider || !thumb) {
      return;
    }

    const offset = ((slider.clientWidth - 52) * value) / 100;
    thumb.style.transform = `translate3d(${offset}px, 0, 0)`;
  };

  useLayoutEffect(() => {
    valueRef.current = targetValue;
    updateThumbPosition(targetValue);

    const slider = sliderRef.current;
    if (!slider) {
      return;
    }

    const resizeObserver = new ResizeObserver(() => updateThumbPosition(valueRef.current));
    resizeObserver.observe(slider);

    return () => {
      resizeObserver.disconnect();
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [targetValue]);

  const scheduleThumbPosition = (value: number) => {
    valueRef.current = value;
    if (animationFrameRef.current !== null) {
      return;
    }

    animationFrameRef.current = requestAnimationFrame(() => {
      updateThumbPosition(valueRef.current);
      animationFrameRef.current = null;
    });
  };

  const selectMode = (nextMode: PortfolioMode) => {
    setSliderValue(nextMode === 'machine' ? 100 : 0);
    valueRef.current = nextMode === 'machine' ? 100 : 0;
    onChange(nextMode);
  };

  const commitSlider = (value: number) => {
    const nextMode = value >= 50 ? 'machine' : 'human';
    selectMode(nextMode);
  };

  const getDraggedValue = (event: PointerEvent<HTMLInputElement>) => {
    const track = event.currentTarget.parentElement;
    if (!track) {
      return valueRef.current;
    }

    const rect = track.getBoundingClientRect();
    const thumbWidth = 52;
    const usableWidth = Math.max(1, rect.width - thumbWidth);
    const delta = ((event.clientX - dragRef.current.startX) / usableWidth) * 100;
    const value = dragRef.current.startValue + delta;
    return Math.min(100, Math.max(0, value));
  };

  const startPointerSlide = (event: PointerEvent<HTMLInputElement>) => {
    event.preventDefault();
    dragRef.current = {
      active: true,
      startX: event.clientX,
      startValue: valueRef.current,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const movePointerSlide = (event: PointerEvent<HTMLInputElement>) => {
    if (dragRef.current.active && event.currentTarget.hasPointerCapture(event.pointerId)) {
      scheduleThumbPosition(getDraggedValue(event));
    }
  };

  const finishPointerSlide = (event: PointerEvent<HTMLInputElement>) => {
    const finalValue = getDraggedValue(event);
    dragRef.current.active = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    commitSlider(finalValue);
  };

  return (
    <div className={`portfolio-mode-toggle portfolio-mode-toggle--${mode}`} role="group" aria-label="Portfolio display mode">
      <div className="portfolio-mode-toggle__desktop">
        <button
          type="button"
          className="portfolio-mode-toggle__option"
          aria-pressed={mode === 'human'}
          onClick={() => selectMode('human')}
        >
          <span className="portfolio-mode-toggle__dot" aria-hidden="true" />
          Human
        </button>
        <button
          type="button"
          className="portfolio-mode-toggle__option"
          aria-pressed={mode === 'machine'}
          onClick={() => selectMode('machine')}
        >
          <span className="portfolio-mode-toggle__dot" aria-hidden="true" />
          Machine
        </button>
      </div>

      <label className="portfolio-mode-slider" ref={sliderRef}>
        <span className="portfolio-mode-slider__text" aria-hidden="true">
          {mode === 'human' ? 'slide to machine →' : '← slide to human'}
        </span>
        <span className="portfolio-mode-slider__thumb" aria-hidden="true" ref={thumbRef}>
          <span>{mode === 'human' ? '›' : '‹'}</span>
        </span>
        <input
          type="range"
          min="0"
          max="100"
          step="1"
          value={sliderValue}
          aria-label={mode === 'human' ? 'Slide right for Machine mode' : 'Slide left for Human mode'}
          onChange={(event) => {
            if (!dragRef.current.active) {
              const value = Number(event.currentTarget.value);
              setSliderValue(value);
              scheduleThumbPosition(value);
            }
          }}
          onPointerDown={startPointerSlide}
          onPointerMove={movePointerSlide}
          onPointerUp={finishPointerSlide}
          onPointerCancel={() => {
            dragRef.current.active = false;
            setSliderValue(targetValue);
            scheduleThumbPosition(targetValue);
          }}
          onKeyUp={(event) => {
            if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
              commitSlider(Number(event.currentTarget.value));
            }
          }}
        />
      </label>
    </div>
  );
}
