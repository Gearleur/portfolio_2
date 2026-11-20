import { useCopyText } from '../../../shared/hooks/useCopyText';
import { Range } from '../../atelier/controls';
import { durees } from './passage';
import type { Sens } from './passage';
import { BORNES, ETIQUETTES, PROPOSITIONS, RETENU, degres, etatDe, exposant, fois, intacte, nomFond, pourcent, proposition, resume, secondes } from './reglages';
import type { Etat, Foyer, Reglages } from './reglages';

/*
 * The bench's panel (step M4), made like M3's: the three propositions to start from, the passage
 * to play again or to go through by hand, then the bubble, its rim, the number, the terminal that
 * comes over it and the black side's colour, each within narrow bounds.
 */

type Maj = (maj: (etat: Etat) => Etat) => void;

/** One of a few values. */
function Choix<T extends string>({ titre, options, valeur, onChoix }: { titre: string; options: [T, string][]; valeur: T; onChoix: (valeur: T) => void }) {
  return (
    <div className="atelier-segment" role="group" aria-label={titre}>
      <span className="atelier-segment__legend">{titre}</span>
      {options.map(([id, nom]) => (
        <button key={id} type="button" aria-pressed={id === valeur} onClick={() => onChoix(id)}>
          {nom}
        </button>
      ))}
    </div>
  );
}

const px = (v: number) => `${v} px`;

const FOYERS: [Foyer, string][] = [
  ['bouton', 'Bouton'],
  ['bord', 'Bord'],
  ['centre', 'Centre'],
];

const TEINTES: Record<Reglages['teintes'], string> = {
  reference: 'Celles de ta vidéo : rouge orangé en haut, rose, violet, bleu, cyan en bas.',
  onde: 'Celles de l’onde de la Vitrine (neige-vermillon) : vermillon en haut, rouge sombre, neige, ardoise en bas.',
  coquelicot: 'L’accent du site et rien d’autre, du coquelicot clair au rouge sombre du pétale de l’interrupteur.',
};

const GENRES: Record<Reglages['genre'], string> = {
  fondu: 'Le terminal apparaît en fondu, sur place.',
  montee: 'Il monte de quelques px en apparaissant, comme une lame qu’on pose.',
  lignes: 'Son verre apparaît d’abord, puis ses lignes s’impriment de haut en bas.',
};

type Props = {
  etat: Etat;
  onChange: Maj;
  /** The side the passage goes to. */
  machine: boolean;
  /** The moment the passage is held at, if it is. */
  fige: number | null;
  onJouer: (sens: Sens) => void;
  onFiger: (t: number) => void;
};

export function Panneau({ etat, onChange, machine, fige, onJouer, onFiger }: Props) {
  const { copy, state } = useCopyText();
  const r = etat.reglages;
  const telle = intacte(r);
  const bord = r.foyer === 'bord' || r.retrait === 'bord';
  const sens: Sens = machine ? 'aller' : 'retour';
  const { totale } = durees(r, sens);
  const regler = (patch: Partial<Reglages>) => onChange((courant) => ({ ...courant, reglages: { ...courant.reglages, ...patch } }));

  return (
    <div className="atelier-panel">
      <fieldset>
        <legend>Propositions</legend>
        <div className="atelier-presets">
          {PROPOSITIONS.map((p) => (
            <button
              key={p.id}
              type="button"
              aria-pressed={p === telle}
              title={p.pari}
              onClick={() => {
                onChange(() => etatDe(p.id));
                onJouer(sens);
              }}
            >
              <span className="m4-glyphe" data-id={p.id} />
              {p.nom}
            </button>
          ))}
        </div>
        <p className={telle ? 'atelier-panel__note m1-pari' : 'atelier-panel__note'}>{telle ? telle.pari : `Partie de « ${proposition(etat.depart).nom} », réglée à la main.`}</p>
      </fieldset>

      <fieldset>
        <legend>Voir le passage</legend>
        <div className="atelier-segment" role="group" aria-label="Rejouer le passage">
          <span className="atelier-segment__legend">Rejouer</span>
          <button type="button" aria-pressed={machine} onClick={() => onJouer('aller')}>
            Aller, vers la Machine
          </button>
          <button type="button" aria-pressed={!machine} onClick={() => onJouer('retour')}>
            Retour
          </button>
        </div>
        <Range label="Temps" min={0} max={100} step={0.5} value={Math.round((fige ?? 0) * 200) / 2} format={(v) => (fige === null ? 'libre' : `${String(v).replace('.', ',')} % · ${secondes((v / 100) * totale)}`)} onChange={(v) => onFiger(v / 100)} />
        <p className="atelier-panel__note">
          Le curseur de temps fige le passage sur une image, celle du sens joué en dernier ({machine ? 'aller' : 'retour'}, {secondes(totale)} avec le terminal) : les réglages s’y voient tout de suite. L’interrupteur ou « Rejouer » le relancent.
        </p>
      </fieldset>

      <fieldset>
        <legend>La bulle</legend>
        <Choix titre="Naît" options={FOYERS} valeur={r.foyer} onChoix={(foyer) => regler({ foyer })} />
        <Choix titre="Se retire" options={FOYERS} valeur={r.retrait} onChoix={(retrait) => regler({ retrait })} />
        <Range label="Durée" {...BORNES.duree} value={r.duree} format={secondes} onChange={(duree) => regler({ duree })} />
        <Range label="Retour" {...BORNES.retour} value={r.retour} format={(v) => `${pourcent(v)} · ${secondes(r.duree * v)}`} onChange={(retour) => regler({ retour })} />
        <Range label="Courbe" {...BORNES.courbe} value={r.courbe} format={(v) => `${pourcent(v)} · t^${String(exposant(v)).replace('.', ',')}`} onChange={(courbe) => regler({ courbe })} />
        <Range label="Amorce" {...BORNES.amorce} value={r.amorce} format={pourcent} onChange={(amorce) => regler({ amorce })} />
        {bord && (
          <>
            <Choix titre="Bord" options={[['droite', 'Droit'], ['gauche', 'Gauche']]} valeur={r.cote} onChoix={(cote) => regler({ cote })} />
            <Range label="Taille" {...BORNES.taille} value={r.taille} format={(v) => `${fois(v)} la hauteur`} onChange={(taille) => regler({ taille })} />
            <Range label="Pente" {...BORNES.direction} value={r.direction} format={degres} onChange={(direction) => regler({ direction })} />
          </>
        )}
        <p className="atelier-panel__note">
          Une seule bulle : elle s’étend vers la Machine et se rétracte vers la page, sans rien traverser. « Naît » et « Se retire » disent d’où elle part et où elle rentre : sous le bouton de l’interrupteur, au-delà d’un bord de l’écran comme dans ta vidéo, ou au centre. La durée est celle de l’extension ; la courbe dit à quel point c’est lent au début et rapide à la fin.
          {bord ? ' Venue d’un bord, sa taille est son rayon quand elle entre dans l’écran : petite, une bulle bien ronde ; grande, un front presque droit.' : ''}
        </p>
      </fieldset>

      <fieldset>
        <legend>Le liseré</legend>
        <Choix titre="Teintes" options={[['reference', 'Référence'], ['onde', 'Onde du site'], ['coquelicot', 'Coquelicot']]} valeur={r.teintes} onChoix={(teintes) => regler({ teintes })} />
        <Range label="Largeur" {...BORNES.largeur} value={r.largeur} format={px} onChange={(largeur) => regler({ largeur })} />
        <Range label="Intensité" {...BORNES.intensite} value={r.intensite} format={pourcent} onChange={(intensite) => regler({ intensite })} />
        <Range label="Saturation" {...BORNES.saturation} value={r.saturation} format={pourcent} onChange={(saturation) => regler({ saturation })} />
        <p className="atelier-panel__note">{TEINTES[r.teintes]} La largeur est celle du flou quand la bulle va le plus vite : lente, son bord est un trait fin, comme au début de ta vidéo.</p>
      </fieldset>

      <fieldset>
        <legend>Le numéro</legend>
        <label className="m4-numero">
          <span>Numéro</span>
          <input type="text" inputMode="numeric" maxLength={8} value={r.numero} onChange={(event) => regler({ numero: event.currentTarget.value.replace(/[^0-9A-Za-z .-]/g, '').slice(0, 8) })} />
        </label>
        <Choix titre="Lettre" options={[['serif', 'Serif'], ['mono', 'Terminal'], ['bascule', 'L’une puis l’autre']]} valeur={r.lettre} onChoix={(lettre) => regler({ lettre })} />
        <Range label="Corps" {...BORNES.corps} value={r.corps} format={px} onChange={(corps) => regler({ corps })} />
        <Choix titre="Place" options={[['gauche', 'À gauche'], ['centre', 'Au milieu']]} valeur={r.place} onChoix={(place) => regler({ place })} />
        <Choix titre="Étiquette" options={[['dessus', 'Dessus'], ['dessous', 'Dessous']]} valeur={r.etiquette} onChoix={(etiquette) => regler({ etiquette })} />
        <Choix titre="Langue" options={[['fr', ETIQUETTES.fr], ['en', ETIQUETTES.en]]} valeur={r.langue} onChoix={(langue) => regler({ langue })} />
        <Range label="Flou au bord" {...BORNES.flou} value={r.flou} format={px} onChange={(flou) => regler({ flou })} />
        <p className="atelier-panel__note">
          Le nombre fait partie du noir : c’est le bord de la bulle qui le découvre, flouté à son passage, et il reste. À gauche, il part de la marge de la page, là où commence le titre. « L’une puis l’autre » : en serif tant que la bulle bouge, dans la police du terminal une fois celui-ci posé.
        </p>
      </fieldset>

      <fieldset>
        <legend>Le terminal, posé dessus</legend>
        <Choix titre="Entrée" options={[['fondu', 'Fondu'], ['montee', 'Montée'], ['lignes', 'Lignes']]} valeur={r.genre} onChoix={(genre) => regler({ genre })} />
        <Range label="Délai" {...BORNES.delai} value={r.delai} format={secondes} onChange={(delai) => regler({ delai })} />
        <Range label="Entrée" {...BORNES.entree} value={r.entree} format={secondes} onChange={(entree) => regler({ entree })} />
        <Range label="Transparence" {...BORNES.transparence} value={r.transparence} format={pourcent} onChange={(transparence) => regler({ transparence })} />
        <Range label="Force du nombre" {...BORNES.force} value={r.force} format={(v) => `${pourcent(v)} · ${pourcent(v * r.transparence)} vu`} onChange={(force) => regler({ force })} />
        <Choix titre="Nombre dessous" options={[['plein', 'Plein'], ['contour', 'Contour']]} valeur={r.trace} onChoix={(trace) => regler({ trace })} />
        <p className="atelier-panel__note">
          {GENRES[r.genre]} Il n’a pas de bulle à lui : il arrive {secondes(r.delai)} après le noir, en {secondes(r.entree)}, dans la lame de verre de M1, qui laisse passer {pourcent(r.transparence)} de ce qu’il y a dessous. Le nombre, blanc pendant l’éclipse, retombe alors à sa force : sous le verre il n’en reste que le produit des deux, un gris sombre sur lequel les lignes se lisent. Au retour le terminal s’efface d’abord, puis la bulle se rétracte.
        </p>
      </fieldset>

      <fieldset>
        <legend>Le côté noir</legend>
        <Range label="Fond" {...BORNES.fond} value={r.fond} format={nomFond} onChange={(fond) => regler({ fond })} />
        <p className="atelier-panel__note">La couleur de l’intérieur de la bulle, donc du fond sur lequel le terminal est posé : du noir pur au bleu nuit qu’avait sa lame de verre à M1, vue sur le papier.</p>
      </fieldset>

      <div className="atelier-panel__footer">
        <button type="button" title="Revenir à tes réglages de base" onClick={() => onChange(() => ({ depart: 'eclipse', reglages: RETENU }))}>
          Réinitialiser
        </button>
        <button type="button" onClick={() => copy(resume(etat))}>
          {state === 'copied' ? 'Copié' : state === 'error' ? 'Copie impossible' : 'Copier mes réglages'}
        </button>
      </div>
    </div>
  );
}
