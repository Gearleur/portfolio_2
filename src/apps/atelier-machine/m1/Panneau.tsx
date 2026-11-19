import { useCopyText } from '../../../shared/hooks/useCopyText';
import { Range } from '../../atelier/controls';
import { percent } from '../../atelier/format';
import { BORNES, MANIERES, NOMS, PROPOSITIONS, etatDe, nomTeinte, origine, partieDe, pleine, proposition, provenance, resume } from './reglages';
import type { Etat, Partie, Reglages } from './reglages';

/*
 * The bench's panel (step M1), made like the background's at step 1: presets to start
 * from, then bounded sliders. Each part of the picture has its manners, one per proposition:
 * picking one brings that part as it was proposed, and the sliders tune it from there. So
 * the eraser of one proposition can go with the glass of another.
 */

const px = (v: number) => `${v}\u202fpx`;
const dixieme = (v: number) => `${v.toFixed(1).replace('.', ',')}\u202fpx`;
const degres = (v: number) => `${v < 0 ? '−' : ''}${Math.abs(v)}°`;
const traits = (v: number) => (v === 0 ? 'aucun' : `${v} trait${v > 1 ? 's' : ''}`);
const clarte = (v: number) => `${(v * 100).toFixed(1).replace('.', ',')}\u202f%`;

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

export function Panneau({ etat, onChange }: { etat: Etat; onChange: Maj }) {
  const { copy, state } = useCopyText();
  const { page, gomme, miniatures, verre } = etat.reglages;
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
              <span className="m1-glyphe" data-id={p.id} />
              {p.nom}
            </button>
          ))}
        </div>
        <p className={intacte ? 'atelier-panel__note m1-pari' : 'atelier-panel__note'}>
          {intacte ? intacte.pari : seule ? `« ${seule.nom} », réglée à la main.` : `Mélange : ${melange}.`}
        </p>
      </fieldset>

      <fieldset>
        <legend>La page humaine</legend>
        <Manieres partie="page" valeur={page} onChange={onChange} />
        <Range label="Reste" {...BORNES.page.reste} value={page.reste} format={percent} onChange={(reste) => regler('page', { reste })} />
        <Range label="Bavure" {...BORNES.page.bavure} value={page.bavure} format={dixieme} onChange={(bavure) => regler('page', { bavure })} />
        {/* a hollow has no colour: nothing for the accent to tint */}
        {page.maniere !== 'sec' && (
          <Range label="Coquelicot" {...BORNES.page.accent} value={page.accent} format={percent} onChange={(accent) => regler('page', { accent })} />
        )}
        <Range label="Papier" {...BORNES.page.papier} value={page.papier} format={clarte} onChange={(papier) => regler('page', { papier })} />
        <Range label="Grain" {...BORNES.page.grain} value={page.grain} format={percent} onChange={(grain) => regler('page', { grain })} />
      </fieldset>

      <fieldset>
        <legend>La gomme</legend>
        <Manieres partie="gomme" valeur={gomme} onChange={onChange} />
        <Range label="Nombre" {...BORNES.gomme.nombre} value={gomme.nombre} format={traits} onChange={(nombre) => regler('gomme', { nombre })} />
        <Range label="Largeur" {...BORNES.gomme.largeur} value={gomme.largeur} format={px} onChange={(largeur) => regler('gomme', { largeur })} />
        <Range label="Angle" {...BORNES.gomme.angle} value={gomme.angle} format={degres} onChange={(angle) => regler('gomme', { angle })} />
        <Range label="Opacité" {...BORNES.gomme.opacite} value={gomme.opacite} format={percent} onChange={(opacite) => regler('gomme', { opacite })} />
        <Range label="Irrégularité" {...BORNES.gomme.irregularite} value={gomme.irregularite} format={percent} onChange={(irregularite) => regler('gomme', { irregularite })} />
        <p className="m1-tirage">
          Tirage n° {gomme.graine}
          <button type="button" className="atelier-button" onClick={() => regler('gomme', { graine: 1 + Math.floor(Math.random() * BORNES.gomme.graine.max) })}>
            Retirer
          </button>
        </p>
      </fieldset>

      <fieldset>
        <legend>Les miniatures</legend>
        <Manieres partie="miniatures" valeur={miniatures} onChange={onChange} />
        <Range label="Profondeur" {...BORNES.miniatures.profondeur} value={miniatures.profondeur} format={percent} onChange={(profondeur) => regler('miniatures', { profondeur })} />
        <Range label="Formes" {...BORNES.miniatures.formes} value={miniatures.formes} format={percent} onChange={(formes) => regler('miniatures', { formes })} />
        <p className="atelier-panel__note">Formes : d’abord les grandes masses de la miniature, puis ses détails.</p>
      </fieldset>

      <fieldset>
        <legend>Le verre fumé</legend>
        <Manieres partie="verre" valeur={verre} onChange={onChange} />
        <Range label="Teinte" {...BORNES.verre.teinte} value={verre.teinte} format={nomTeinte} onChange={(teinte) => regler('verre', { teinte })} />
        <Range label="Opacité" {...BORNES.verre.opacite} value={verre.opacite} format={percent} onChange={(opacite) => regler('verre', { opacite })} />
        <Range label="Flou" {...BORNES.verre.flou} value={verre.flou} format={px} onChange={(flou) => regler('verre', { flou })} />
        <Range label="Largeur" {...BORNES.verre.largeur} value={verre.largeur} format={(v) => (pleine('largeur', v) ? 'toute' : px(v))} onChange={(largeur) => regler('verre', { largeur })} />
        <Range label="Hauteur" {...BORNES.verre.hauteur} value={verre.hauteur} format={(v) => (pleine('hauteur', v) ? 'toute' : px(v))} onChange={(hauteur) => regler('verre', { hauteur })} />
        <Range label="Position ↔" {...BORNES.verre.x} value={verre.x} format={percent} onChange={(x) => regler('verre', { x })} />
        <Range label="Position ↕" {...BORNES.verre.y} value={verre.y} format={percent} onChange={(y) => regler('verre', { y })} />
        <div className="atelier-segment" role="group" aria-label="Le cube du prompt">
          <span className="atelier-segment__legend">Cube du prompt</span>
          <button type="button" aria-pressed={verre.curseur === 'accent'} onClick={() => regler('verre', { curseur: 'accent' })}>
            Coquelicot
          </button>
          <button type="button" aria-pressed={verre.curseur === 'gris'} onClick={() => regler('verre', { curseur: 'gris' })}>
            Gris
          </button>
        </div>
      </fieldset>

      <div className="atelier-panel__footer">
        <button type="button" title={`Revenir à « ${proposition(etat.depart).nom} »`} onClick={() => onChange((courant) => etatDe(courant.depart))}>
          Réinitialiser
        </button>
        <button type="button" onClick={() => copy(resume(etat))}>
          {state === 'copied' ? 'Copié' : state === 'error' ? 'Copie impossible' : 'Copier mes réglages'}
        </button>
      </div>
    </div>
  );
}
