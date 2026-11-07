import { useMemo } from 'react';
import type { CSSProperties } from 'react';

type PointLatticeProps = {
  /** Depth of the lattice — one plane per challenge. */
  depth: number;
  /** Active depth plane (0 = front, depth-1 = back). */
  activeIndex: number;
};

/**
 * Dense isometric point lattice in pure CSS 3D. Points are connected by thin
 * axis-aligned struts (no SVG, so perspective is preserved). The depth axis maps
 * to the challenges: one plane lights up per active step, sweeping back-to-front.
 * The whole lattice yaws a little per active step for motion between checkpoints.
 */
const COLS = 4;
const ROWS = 3;

const colCenter = (COLS - 1) / 2;
const rowCenter = (ROWS - 1) / 2;

type Node = { col: number; row: number; depth: number };

function buildNodes(depth: number): Node[] {
  const nodes: Node[] = [];
  for (let d = 0; d < depth; d += 1) {
    for (let r = 0; r < ROWS; r += 1) {
      for (let c = 0; c < COLS; c += 1) {
        nodes.push({ col: c, row: r, depth: d });
      }
    }
  }
  return nodes;
}

function nodeVars(node: Node, depthCenter: number): CSSProperties {
  return {
    '--cx': node.col - colCenter,
    '--cy': node.row - rowCenter,
    '--cz': node.depth - depthCenter,
  } as CSSProperties;
}

export function PointLattice({ depth, activeIndex }: PointLatticeProps) {
  const depthCenter = (depth - 1) / 2;
  const yaw = -34 + Math.max(0, activeIndex) * 8;
  const latticeStyle = { '--yaw': `${yaw}deg` } as CSSProperties;

  const nodes = useMemo(() => buildNodes(depth), [depth]);

  return (
    <div className="lattice-scene" aria-hidden="true">
      <div className="dot-lattice" style={latticeStyle}>
        {nodes.map((node, index) => {
          const active = node.depth === activeIndex;
          const base = nodeVars(node, depthCenter);
          const reveal = { '--reveal': `${index * 18}ms` } as CSSProperties;
          const key = `${node.col}-${node.row}-${node.depth}`;

          return (
            <div className="dot-node" style={{ ...base, ...reveal }} key={key}>
              {node.col < COLS - 1 && (
                <span className={`strut strut--x${active ? ' is-active' : ''}`} />
              )}
              {node.row < ROWS - 1 && (
                <span className={`strut strut--y${active ? ' is-active' : ''}`} />
              )}
              {node.depth < depth - 1 && <span className="strut strut--z" />}
              <span className={`dot${active ? ' is-active' : ''}`} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
