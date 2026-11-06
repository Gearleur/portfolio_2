import type { ReactNode } from 'react';
import { GridColumns } from './Temoin';

// Stand-in content for the Vitrine's first screen; the real words come at step 7.
const NAV = ['Projets', 'À propos', 'CV', 'Contact'];
const FACTS = [
  ['Rôle', 'AI engineer'],
  ['Approche', 'Du prototype à la production'],
  ['Langues', 'Français · English'],
];
const PROJECTS = [
  { number: '01', name: 'Projet témoin A', stage: 'En production' },
  { number: '02', name: 'Projet témoin B', stage: 'Pilote' },
  { number: '03', name: 'Projet témoin C', stage: 'Prototype' },
];
const BIO = 'Des technologies d’IA récentes mises en service, avec des interfaces que les équipes adoptent vraiment.';
const CONTACT = ['E-mail', 'LinkedIn', 'GitHub'];

type MaquetteProps = {
  /** Grey blocks in place of the words, to judge the placement only. */
  blocks: boolean;
  /** Shows the columns over the page. */
  columns?: number;
};

/**
 * The Vitrine's first screen at 1440 × 900, as retained at step 5: the content
 * starts at the left edge, the name, nav and contact close the page on the right.
 * The explored layouts are in the history (commit 0022543).
 */
export function Maquette({ blocks, columns }: MaquetteProps) {
  return (
    <div className="maquette" data-blocks={blocks ? '' : undefined}>
      {columns && <GridColumns count={columns} />}
      <div className="m-side">
        <p className="m-name">
          <T>Alexandre Teixeira</T>
        </p>
        <ul className="m-nav m-label">
          {NAV.map((item, index) => (
            <li key={item} aria-current={index === 0 ? 'page' : undefined}>
              <T>{item}</T>
            </li>
          ))}
          <li className="m-lang">
            <T>FR · EN</T>
          </li>
        </ul>
        <ul className="m-contact m-label">
          {CONTACT.map((item) => (
            <li key={item}>
              <T>{item}</T>
            </li>
          ))}
        </ul>
      </div>
      <div className="m-hero">
        <p className="m-title">
          <T>AI engineer, du prototype à la </T>
          <mark>
            <T>production</T>
          </mark>
          <T>.</T>
        </p>
        <p className="m-bio">
          <T>{BIO}</T>
        </p>
        <dl className="m-facts">
          {FACTS.map(([term, detail]) => (
            <div key={term}>
              <dt className="m-label">
                <T>{term}</T>
              </dt>
              <dd>
                <T>{detail}</T>
              </dd>
            </div>
          ))}
        </dl>
      </div>
      <ul className="m-visuals">
        {PROJECTS.map((project) => (
          <li key={project.number}>
            <span className="m-img" />
            <span>
              <T>{project.name}</T>
            </span>
            <span className="m-label">
              <T>{project.stage}</T>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** A run of words, which the blocks view turns into grey bars. */
const T = ({ children }: { children: ReactNode }) => <span className="m-t">{children}</span>;
