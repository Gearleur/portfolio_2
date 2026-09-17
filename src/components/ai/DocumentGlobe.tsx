import { useEffect, useRef } from 'react';
import './documentGlobe.css';

type DocumentGlobeProps = {
  /** Scattered objects at 0, a complete globe from .4 onward. */
  progress: number;
  active: boolean;
  reducedMotion?: boolean;
};

const clamp = (value: number) => Math.min(1, Math.max(0, value));
const mix = (from: number, to: number, amount: number) => from + (to - from) * amount;
const count = 26;
const goldenAngle = Math.PI * (3 - Math.sqrt(5));
const objects = Array.from({ length: count }, (_, index) => {
  const y = 1 - (index / (count - 1)) * 2;
  const ring = Math.sqrt(1 - y * y);
  const angle = index * goldenAngle;
  return {
    x: Math.cos(angle) * ring,
    y,
    z: Math.sin(angle) * ring,
    scatterX: Math.sin(index * 12.9898 + 4) * .56,
    scatterY: Math.cos(index * 7.233 + 1) * .45,
    rotation: Math.sin(index * 3.7) * 19,
    kind: ['document', 'photo', 'chat', 'mail', 'chart', 'sheet'][index % 6],
  };
});

function Preview({ kind, index }: { kind: string; index: number }) {
  switch (kind) {
    case 'photo':
      return <div className="doc-globe__photo">
        <img src={Math.floor(index / 6) % 2 ? '/assets/wallpapper_desktop2.png' : '/assets/cinematique/prairie.png'} alt="" draggable="false" />
        <span>Références visuelles <span>↗</span></span>
      </div>;
    case 'chat':
      return <div className="doc-globe__chat">
        <div className="doc-globe__chat-heading"><i /> Conversation <span>···</span></div>
        <span className="doc-globe__bubble">On avance sur l’idée ?</span>
        <span className="doc-globe__bubble doc-globe__bubble--blue">Tout est au même endroit.</span>
        <span className="doc-globe__typing"><i /><i /><i /></span>
      </div>;
    case 'mail':
      return <div className="doc-globe__mail">
        <div className="doc-globe__mail-heading"><span>↗</span> Boîte de réception <i /></div>
        <strong>La prochaine étape</strong>
        <div className="doc-globe__text-lines"><i /><i /><i /></div>
        <span className="doc-globe__attachment"><span>▧</span> Notes de réunion.pdf</span>
      </div>;
    case 'chart':
      return <div className="doc-globe__chart">
        <span className="doc-globe__mini-label">Vue d’ensemble <span>↗</span></span>
        <svg viewBox="0 0 140 62" fill="none" aria-hidden="true">
          <path d="M0 15H140M0 34H140M0 53H140" stroke="currentColor" strokeOpacity=".09" />
          <path d="M0 56C12 56 15 36 27 39S39 52 51 34 67 42 81 23 97 35 111 17 129 20 140 5V62H0Z" fill="url(#doc-globe-chart-fill)" />
          <path d="M0 56C12 56 15 36 27 39S39 52 51 34 67 42 81 23 97 35 111 17 129 20 140 5" stroke="#f2773f" strokeWidth="2" />
        </svg>
        <div className="doc-globe__chart-footer"><span>Explorer</span><span>Les informations utiles</span></div>
      </div>;
    case 'sheet':
      return <div className="doc-globe__sheet">
        <span className="doc-globe__mini-label"><span className="doc-globe__sheet-icon">▦</span> Suivi du projet <span>···</span></span>
        <div className="doc-globe__sheet-grid">
          {Array.from({ length: 20 }, (_, cell) => <span key={cell} className={cell === 6 || cell === 14 ? 'doc-globe__sheet-cell--active' : undefined}>{cell < 4 ? ['Étape', 'Équipe', 'État', 'Suite'][cell] : cell % 4 === 2 ? '✓' : '—'}</span>)}
        </div>
      </div>;
    default:
      return <div className="doc-globe__document">
        <div className="doc-globe__document-heading"><span>PDF</span><span>0{Math.floor(index / 6) + 1} / NOTES</span></div>
        <strong>{index % 12 ? 'Une idée à explorer.' : 'Le point de départ.'}</strong>
        <div className="doc-globe__text-lines"><i /><i /><i /></div>
        <div className="doc-globe__document-bottom"><div><i /><i /><i /><i /></div><span>↗</span></div>
      </div>;
  }
}

/** A decorative sphere of local UI previews. No scripts or external assets are loaded. */
export function DocumentGlobe({ progress, active, reducedMotion = false }: DocumentGlobeProps) {
  const root = useRef<HTMLDivElement>(null);
  const tiles = useRef<Array<HTMLDivElement | null>>([]);
  const currentProgress = useRef(progress);
  const paint = useRef<(() => void) | null>(null);
  const rotation = useRef(.35);

  useEffect(() => {
    currentProgress.current = progress;
    paint.current?.();
  }, [progress]);

  useEffect(() => {
    const element = root.current;
    if (!element) return;
    let size = element.clientWidth;
    let frame = 0;
    let previousTime = 0;
    let inView = false;
    const draw = () => {
      const formation = reducedMotion ? 1 : clamp(currentProgress.current / .4);
      const eased = 1 - (1 - formation) ** 3;
      const angle = rotation.current;
      const radius = size * .363;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      // A small tilt gives the paths depth without tilting the actual documents.
      const tilt = -.12;
      const ct = Math.cos(tilt);
      const st = Math.sin(tilt);
      objects.forEach((object, index) => {
        const tile = tiles.current[index];
        if (!tile) return;
        const rx = object.x * cos + object.z * sin;
        const rz = object.z * cos - object.x * sin;
        const ry = object.y * ct - rz * st;
        const z = object.y * st + rz * ct;
        const depth = (z + 1) / 2;
        const perspective = 1 + z * .1;
        const x = mix(object.scatterX * size, rx * radius * perspective, eased);
        const y = mix(object.scatterY * size, ry * radius * perspective, eased);
        const scale = mix(.84, .53 + depth * .47, eased) * size / 720;
        const twist = mix(object.rotation, Math.sin(index * 1.5) * 2, eased);
        tile.style.transform = `translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,0) translate(-50%,-50%) rotate(${twist.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
        tile.style.opacity = String(mix(.85, .30 + depth * .70, eased));
        tile.style.zIndex = String(Math.round(depth * 100));
        tile.style.filter = `saturate(${mix(1, .55 + depth * .45, eased).toFixed(2)})`;
      });
      element.style.setProperty('--doc-globe-formed', String(eased));
      element.dataset.ready = 'true';
    };
    paint.current = draw;
    const animate = (time: number) => {
      frame = 0;
      if (previousTime) rotation.current += Math.min(time - previousTime, 48) * .00015;
      previousTime = time;
      draw();
      frame = requestAnimationFrame(animate);
    };
    const sync = () => {
      const shouldAnimate = active && inView && !reducedMotion && !document.hidden;
      if (shouldAnimate && !frame) {
        previousTime = 0;
        frame = requestAnimationFrame(animate);
      } else if (!shouldAnimate && frame) {
        cancelAnimationFrame(frame);
        frame = 0;
        previousTime = 0;
      }
      draw();
    };
    const resize = new ResizeObserver(() => { size = element.clientWidth; draw(); });
    const visibility = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; sync(); });
    resize.observe(element);
    visibility.observe(element);
    document.addEventListener('visibilitychange', sync);
    draw();
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      visibility.disconnect();
      document.removeEventListener('visibilitychange', sync);
      paint.current = null;
    };
  }, [active, reducedMotion]);

  return <div ref={root} className={`doc-globe${reducedMotion ? ' doc-globe--reduced' : ''}`} aria-hidden="true">
    <svg className="doc-globe__defs" width="0" height="0"><defs><linearGradient id="doc-globe-chart-fill" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#f2773f" stopOpacity=".2" /><stop offset="1" stopColor="#f2773f" stopOpacity="0" /></linearGradient></defs></svg>
    <div className="doc-globe__atmosphere" />
    <div className="doc-globe__orbit doc-globe__orbit--one" />
    <div className="doc-globe__orbit doc-globe__orbit--two" />
    <span className="doc-globe__coordinate doc-globe__coordinate--top">[ CONTEXTE ]</span>
    <span className="doc-globe__coordinate doc-globe__coordinate--bottom">26 SOURCES · UNE INTENTION</span>
    {objects.map((object, index) => <div
      className={`doc-globe__tile doc-globe__tile--${object.kind}`}
      ref={(node) => { tiles.current[index] = node; }}
      key={index}
    ><Preview kind={object.kind} index={index} /></div>)}
  </div>;
}
