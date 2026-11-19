import { useCopyText } from '../../../shared/hooks/useCopyText';
import { Range } from '../../atelier/controls';
import { percent } from '../../atelier/format';
import { BORNES, FACES, MANIERES, NOMS, PROPOSITIONS, etatDe, origine, partieDe, proposition, provenance, resume } from './reglages';
import type { Etat, Partie, Reglages, Vu } from './reglages';

/*
 * The bench's panel (step M2), made like M1's: the propositions to start from, then each part
 * with its manners (one per proposition: picking one brings that part as it was proposed) and
 * its bounded sliders.
 */

const px = (v: number) => `${v}\u202fpx`;
const virgule = (v: number, decimales = 2) => v.toFixed(decimales).replace('.', ',');

type Maj = (maj: (etat: Etat) => Etat) => void;

/** The manners of a part, and where the one in use comes from. */
function Manieres<P extends Partie>({ partie, valeur, onChange }: { partie: P; valeur: Reglages[P]; onChange: Maj }) {
  const { source, intacte } = origine(partie, valeur);
  const choisie = MANIERES[partie].find((choix) => choix.id === valeur.maniere);
  return (
    <>
      <div className="atelier-segment" role="group" aria-label={`Manière pour ${NOMS[partie]}`}>
        {MANIERES[partie].map((choix) => (
          <button
            key={choix.id}
            type="button"
            aria-pressed={choix.id === valeur.maniere}
            onClick={() => onChange((etat) => ({ ...etat, reglages: { ...etat.reglages, [partie]: partieDe(partie, choix.id) } }))}
          >
            {choix.nom}
          </button>
        ))}
      </div>
      <p className="atelier-panel__note">
        {choisie?.note} Comme dans « {source.nom} »{intacte ? '' : ', puis réglé à la main'}.
      </p>
    </>
  );
}

/** One of a few values, which leaves the part's sliders where they are. */
function Choix<T extends string | boolean>({ titre, options, valeur, onChoix }: { titre: string; options: [T, string][]; valeur: T; onChoix: (valeur: T) => void }) {
  return (
    <div className="atelier-segment" role="group" aria-label={titre}>
      <span className="atelier-segment__legend">{titre}</span>
      {options.map(([id, nom]) => (
        <button key={String(id)} type="button" aria-pressed={id === valeur} onClick={() => onChoix(id)}>
          {nom}
        </button>
      ))}
    </div>
  );
}

export function Panneau({ etat, onChange, vu }: { etat: Etat; onChange: Maj; vu: Vu | null }) {
  const { copy, state } = useCopyText();
  const { police, grille, gris, curseur, habillage } = etat.reglages;
  const { intacte, seule, melange } = provenance(etat.reglages);

  const regler = <P extends Partie>(partie: P, patch: Partial<Reglages[P]>) =>
    onChange((courant) => ({ ...courant, reglages: { ...courant.reglages, [partie]: { ...courant.reglages[partie], ...patch } } }));

  return (
    <div className="atelier-panel">
      <fieldset>
        <legend>Propositions</legend>
        <div className="atelier-presets">
          {PROPOSITIONS.map((p) => (
            <button key={p.id} type="button" aria-pressed={p === (intacte ?? seule)} title={p.pari} onClick={() => onChange(() => etatDe(p.id))}>
              <span className="m2-glyphe" data-id={p.id} />
              {p.nom}
            </button>
          ))}
        </div>
        <p className={intacte ? 'atelier-panel__note m1-pari' : 'atelier-panel__note'}>
          {intacte ? intacte.pari : seule ? `« ${seule.nom} », réglée à la main.` : `Mélange : ${melange}.`}
        </p>
      </fieldset>

      <fieldset>
        <legend>La police</legend>
        <Manieres partie="police" valeur={police} onChange={onChange} />
        {police.maniere === 'embarquee' && (
          <Choix titre="Mono" options={FACES.map((face) => [face.id, face.nom])} valeur={police.face} onChoix={(face) => regler('police', { face })} />
        )}
        <Range label="Corps" {...BORNES.police.corps} value={police.corps} format={px} onChange={(corps) => regler('police', { corps })} />
        <Range label="Graisse" {...BORNES.police.graisse} value={police.graisse} format={String} onChange={(graisse) => regler('police', { graisse })} />
        <Range label="Chasse" {...BORNES.police.chasse} value={police.chasse} format={percent} onChange={(chasse) => regler('police', { chasse })} />
        <p className="atelier-panel__note">
          {vu && `Sur cet ordinateur : ${vu.police}. `}
          {police.maniere === 'embarquee'
            ? 'Sa graisse suit le curseur ; les dossiers et les titres restent en gras.'
            : 'Une police du système n’a souvent que deux graisses : le curseur n’y change rien, sauf avec Cascadia Mono ou SF Mono.'}
        </p>
      </fieldset>

      <fieldset>
        <legend>La grille</legend>
        <Manieres partie="grille" valeur={grille} onChange={onChange} />
        <Range label="Colonnes" {...BORNES.grille.colonnes} value={grille.colonnes} format={(v) => `${v} col.`} onChange={(colonnes) => regler('grille', { colonnes })} />
        <Range label="Marge" {...BORNES.grille.marge} value={grille.marge} format={px} onChange={(marge) => regler('grille', { marge })} />
        <Range label="Interligne" {...BORNES.grille.interligne} value={grille.interligne} format={virgule} onChange={(interligne) => regler('grille', { interligne })} />
        <Choix titre="Commandes" options={[[false, 'Serrées'], [true, 'Aérées']]} valeur={grille.aeree} onChoix={(aeree) => regler('grille', { aeree })} />
        {vu && (
          <p className="atelier-panel__note">
            Écran de {vu.colonnes} × {vu.lignes} cellules de {virgule(vu.cellule[0], 1)} × {virgule(vu.cellule[1], 1)} px. La touche G les montre.
          </p>
        )}
      </fieldset>

      <fieldset>
        <legend>Les gris</legend>
        <Manieres partie="gris" valeur={gris} onChange={onChange} />
        <Range label="Commande" {...BORNES.gris.commande} value={gris.commande} format={percent} onChange={(commande) => regler('gris', { commande })} />
        <Range label="Sortie" {...BORNES.gris.sortie} value={gris.sortie} format={percent} onChange={(sortie) => regler('gris', { sortie })} />
        <Range label="Métadonnées" {...BORNES.gris.meta} value={gris.meta} format={percent} onChange={(meta) => regler('gris', { meta })} />
      </fieldset>

      <fieldset>
        <legend>Le curseur</legend>
        <Manieres partie="curseur" valeur={curseur} onChange={onChange} />
        <Choix titre="Battement" options={[[true, 'Clignote'], [false, 'Fixe']]} valeur={curseur.clignote} onChoix={(clignote) => regler('curseur', { clignote })} />
      </fieldset>

      <fieldset>
        <legend>L’habillage</legend>
        <Manieres partie="habillage" valeur={habillage} onChange={onChange} />
        <Choix titre="Invite" options={[['longue', 'Longue'], ['courte', '~ $'], ['minimale', '$']]} valeur={habillage.invite} onChoix={(invite) => regler('habillage', { invite })} />
      </fieldset>

      <div className="atelier-panel__footer">
        <button type="button" title={`Revenir à « ${proposition(etat.depart).nom} »`} onClick={() => onChange((courant) => etatDe(courant.depart))}>
          Réinitialiser
        </button>
        <button type="button" onClick={() => copy(resume(etat, vu))}>
          {state === 'copied' ? 'Copié' : state === 'error' ? 'Copie impossible' : 'Copier mes réglages'}
        </button>
      </div>
    </div>
  );
}
