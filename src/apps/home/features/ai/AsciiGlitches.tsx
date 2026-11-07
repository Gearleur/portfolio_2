import { useEffect, useRef } from 'react';

const GLYPHS = ['01', '</>', '[ ]', '::', '+', '{_}', '/ /', '0x', '...', '#', '*'];
const ORANGES = ['#ffb86b', '#ff973f', '#f47a30', '#e96224', '#cf501c'];

/** A bounded decorative layer; it never participates in pointer or keyboard input. */
export function AsciiGlitches() {
  const layer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = layer.current;
    if (!root) return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const particles: { node: HTMLSpanElement; born: number; life: number }[] = [];
    let lastPointer = 0;
    let lastAmbient = 0;
    let lastPixel = 0;
    const glyph = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
    const clear = () => {
      particles.forEach(({ node }) => node.remove());
      particles.length = 0;
    };
    const spawn = (x: number, y: number, ambient: boolean, pixel = false) => {
      const count = particles.filter(({ node }) => node.classList.contains('ai-pixel') === pixel).length;
      if (document.hidden || reducedMotion.matches || count >= (pixel ? 6 : 18)) return;
      const title = document.getElementById('ai-title')?.getBoundingClientRect();
      // Keep the reading area and the back button quiet.
      if (y < 110 || (title && x > title.left - 65 && x < title.right + 35
        && y > title.top - 45 && y < title.bottom + 35)) return;
      const node = document.createElement('span');
      const life = pixel ? 2600 : ambient ? 6000 : 2400;
      node.className = pixel ? 'ai-pixel' : `ai-ascii__fragment${ambient ? ' ai-ascii__fragment--ambient' : ''}`;
      if (pixel) {
        const size = [12, 18, 24][Math.floor(Math.random() * 3)];
        node.style.width = `${size}px`;
        node.style.height = `${size}px`;
        node.style.backgroundColor = ORANGES[Math.floor(Math.random() * ORANGES.length)];
      } else {
        node.textContent = ambient ? `${glyph()}\n ${glyph()}` : glyph();
      }
      node.style.left = `${Math.max(12, Math.min(window.innerWidth - 65, x))}px`;
      node.style.top = `${Math.min(window.innerHeight - 50, y)}px`;
      node.style.setProperty('--ascii-life', `${life}ms`);
      root.append(node);
      particles.push({ node, born: performance.now(), life });
    };
    const pointer = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' || performance.now() - lastPointer < 240) return;
      lastPointer = performance.now();
      spawn(event.clientX + 18 + Math.random() * 16, event.clientY + 16, false);
    };
    const timer = window.setInterval(() => {
      if (document.hidden || reducedMotion.matches) { clear(); return; }
      const now = performance.now();
      for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];
        if (now - particle.born > particle.life) {
          particle.node.remove();
          particles.splice(i, 1);
        } else if (!particle.node.classList.contains('ai-pixel') && Math.random() < .24) {
          particle.node.textContent = particle.node.classList.contains('ai-ascii__fragment--ambient')
            ? `${glyph()}\n ${glyph()}` : glyph();
        }
      }
      if (now - lastAmbient > 2200) {
        lastAmbient = now;
        const title = document.getElementById('ai-title')?.getBoundingClientRect();
        if (title && Math.random() < .75) {
          const x = title.left - 55 + Math.random() * (title.width + 110);
          const y = Math.random() < .5 ? title.top - 70 - Math.random() * 60 : title.bottom + 55 + Math.random() * 60;
          spawn(x, y, true);
        } else {
          const edge = Math.random() < .5 ? .04 + Math.random() * .12 : .84 + Math.random() * .1;
          spawn(window.innerWidth * edge, 120 + Math.random() * Math.max(0, window.innerHeight - 190), true);
        }
      }
      // Independent ambient squares: never substitute for cursor glyphs.
      if (now - lastPixel > 980) {
        lastPixel = now;
        spawn(window.innerWidth * (.08 + Math.random() * .84),
          120 + Math.random() * Math.max(0, window.innerHeight - 190), true, true);
      }
    }, 140);
    window.addEventListener('pointermove', pointer, { passive: true });
    document.addEventListener('visibilitychange', clear);
    reducedMotion.addEventListener('change', clear);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('pointermove', pointer);
      document.removeEventListener('visibilitychange', clear);
      reducedMotion.removeEventListener('change', clear);
      clear();
    };
  }, []);

  return <div ref={layer} className="ai-ascii" aria-hidden="true" />;
}
