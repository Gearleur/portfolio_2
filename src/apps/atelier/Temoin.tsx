const PROJETS = [
  ['01', 'Projet témoin A', 'En production', '2025'],
  ['02', 'Projet témoin B', 'Pilote', '2025'],
  ['03', 'Projet témoin C', 'Prototype', '2024'],
];

/**
 * Stand-in Vitrine page used to judge colours and type in use. Its fonts and
 * sizes come from CSS variables (see .temoin in atelier.css); project rows are fake.
 * `relief` presses the values under the labels into the background. `grid` lays
 * the page on columns (sizes from the step 4 variables) and can show them.
 */
type TemoinProps = { relief?: string; grid?: { columns: number; visible: boolean } };

export function Temoin({ relief, grid }: TemoinProps) {
  return (
    <div className="temoin" data-relief={relief === 'plat' ? undefined : relief} data-grid={grid ? '' : undefined}>
      {grid?.visible && <GridColumns count={grid.columns} />}
      <header className="temoin__top">
        <p className="temoin__brand">Alexandre Teixeira</p>
        <p className="temoin__nav">
          <span aria-current="page">Projets</span>
          <span>À propos</span>
          <span>CV</span>
          <span>Contact</span>
        </p>
      </header>
      <div className="temoin__intro">
        <p className="temoin__title">
          AI engineer, du prototype à la <mark>production</mark>.
        </p>
        <dl className="temoin__facts">
          <div>
            <dt>Rôle</dt>
            <dd>AI engineer</dd>
          </div>
          <div>
            <dt>Approche</dt>
            <dd>Du prototype à la production</dd>
          </div>
          <div>
            <dt>Langues</dt>
            <dd>Français · English</dd>
          </div>
        </dl>
      </div>
      <ol className="temoin__index">
        {PROJETS.map(([number, name, stage, year]) => (
          <li key={number}>
            <span>{number}</span>
            <span>{name}</span>
            <span>{stage}</span>
            <span>{year}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

/** The columns over a page, as in Figma; sizes from --cols, --gutter and --margin. */
export function GridColumns({ count }: { count: number }) {
  return (
    <div className="temoin__columns" aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <span key={index} />
      ))}
    </div>
  );
}
