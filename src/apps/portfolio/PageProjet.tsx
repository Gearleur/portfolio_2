import { ProjetMaquette, ProjetMobile } from '../atelier/Projet';
import { PROJETS } from '../atelier/projets';

/*
 * A project page of the Vitrine. It holds everything a project page needs (its
 * texts, its diagrams, its logos), which the home does not: the Vitrine loads
 * this file only when a project is opened, and fetches it in advance once the
 * home is idle.
 */

export default function PageProjet({
  numero,
  telephone,
  onRetour,
  menuOpen,
  onMenu,
}: {
  numero: string;
  telephone: boolean;
  onRetour: () => void;
  menuOpen: boolean;
  onMenu: (ouvert: boolean) => void;
}) {
  const projet = PROJETS[numero];
  if (!projet) return null;
  return telephone ? (
    <ProjetMobile projet={projet} onRetour={onRetour} menuOpen={menuOpen} onMenu={onMenu} />
  ) : (
    <ProjetMaquette projet={projet} onRetour={onRetour} />
  );
}
