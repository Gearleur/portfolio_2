import { useCopyText } from '../../../shared/hooks/useCopyText';
import { Range } from '../../atelier/controls';
import { Choix } from '../m4/Panneau';
import { durees } from '../m4/passage';
import type { Sens } from '../m4/passage';
import { secondes } from '../m4/reglages';
import { passageDe } from './derives';
import { BORNES, CHOIX, PARI_CHOIX, PROPOSITIONS, TAILLES, choisie, colonnes, deplacer, etatDe, intacte, pilule, proposition, resume, toile, virgule } from './reglages';
import type { Etat, Reglages, Reseau } from './reglages';

/*
 * The bench's panel (step M6), made like M4's: the three propositions to start from, the passage
 * to play again or to hold, then each part that can be taken from another proposition (the
 * switch's place, the way to move about, the number's place, the text), and what is not seen but
 * weighs: the canvas's density and when the passage is fetched.
 */

type Maj = (maj: (etat: Etat) => Etat) => void;

const px = (v: number) => `${virgule(v)} px`;

const PLACES: Record<Reglages['interrupteur'], string> = {
  encoche: 'Dans l’encoche de verre, entre ton nom et « Menu », qui s’écartent pour lui. Côté Machine il reste là, sur la première ligne du terminal. Quand le menu s’ouvre, il s’efface avec l’encoche.',
  bas: 'En bas au milieu, comme sur ordinateur, au-dessus de la zone sûre de l’écran : sous le pouce, mais posé sur la page, et le terminal lui laisse sa place.',
  menu: 'Dans le menu seulement : la page reste telle quelle, on ouvre « Menu » pour le trouver, dans la bande vide au-dessus de « Fermer ». Côté Machine il reste à cette place, en haut au milieu.',
};

const RANGS: Record<Reglages['rangs'], string> = {
  lignes: 'Des lignes de terminal : la commande s’écrit toute seule quand on touche un nom, « ← retour » reste en haut.',
  feuille: 'Une liste native : une ligne pleine largeur par fichier, un filet dessous, le poids à droite ; la commande s’écrit d’un coup, ce n’est plus que la trace du geste.',
};

const OUI_NON: [string, string][] = [
  ['non', 'Non'],
  ['oui', 'Oui'],
];

const NUMEROS: Record<Reglages['numero'], string> = {
  etat: 'Grand au milieu pendant l’éclipse ; quand le terminal s’imprime, ses chiffres rétrécissent et descendent se ranger dans la ligne d’état, en bas à gauche, où il est écrit en entier : « humain n° 102923 ». La première ligne est celle de l’encoche, l’interrupteur en occupe le milieu : en bas, il a la place de son étiquette.',
  haut: 'Grand au milieu pendant l’éclipse, puis ses chiffres rétrécissent et montent se ranger sur la première ligne, à droite, là où était « Menu » : « n° 102923 », sans son étiquette, faute de place à côté de l’interrupteur.',
  filigrane: 'Il reste en grand derrière les lignes, à 70 % sous le verre, comme sur l’établi du passage : sur un téléphone il est sous le texte, pas à côté.',
};

type Props = {
  etat: Etat;
  onChange: Maj;
  /** The side the passage goes to, and the moment it is held at, if it is. */
  machine: boolean;
  fige: number | null;
  onJouer: (sens: Sens) => void;
  onFiger: (t: number) => void;
  /** The network the bench pretends to have, and what became of the fetch. */
  reseau: Reseau;
  onReseau: (reseau: Reseau) => void;
  charge: string;
  onOublier: () => void;
};

export function Panneau({ etat, onChange, machine, fige, onJouer, onFiger, reseau, onReseau, charge, onOublier }: Props) {
  const { copy, state } = useCopyText();
  const r = etat.reglages;
  const telle = intacte(r);
  const sens: Sens = machine ? 'aller' : 'retour';
  const { totale } = durees(passageDe(r, 'fr'), sens);
  const regler = (patch: Partial<Reglages>) => onChange((courant) => ({ ...courant, reglages: { ...courant.reglages, ...patch } }));
  const p = pilule(r);
  const t = toile(r.densite);

  return (
    <div className="atelier-panel">
      <fieldset>
        <legend>Propositions</legend>
        <div className="atelier-presets">
          {PROPOSITIONS.map((prop) => (
            <button key={prop.id} type="button" aria-pressed={prop === telle} title={prop.pari} onClick={() => onChange(() => etatDe(prop.id))}>
              <span className="m6-glyphe" data-id={prop.id} />
              {prop.nom}
            </button>
          ))}
        </div>
        <p className={telle || choisie(r) ? 'atelier-panel__note m1-pari' : 'atelier-panel__note'}>{choisie(r) ? PARI_CHOIX : telle ? telle.pari : `Partie de « ${proposition(etat.depart).nom} », réglée à la main : chaque partie ci-dessous se prend à une autre proposition.`}</p>
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
        <Range label="Temps" min={0} max={100} step={0.5} value={Math.round((fige ?? 0) * 200) / 2} format={(v) => (fige === null ? 'libre' : `${virgule(v)} % · ${secondes((v / 100) * totale)}`)} onChange={(v) => onFiger(v / 100)} />
        <p className="atelier-panel__note">Le curseur de temps fige le passage sur une image ({machine ? 'aller' : 'retour'}, {secondes(totale)} avec le terminal) : la largeur du liseré et la définition de la toile s’y jugent. L’interrupteur ou « Rejouer » le relancent.</p>
      </fieldset>

      <fieldset>
        <legend>L’interrupteur</legend>
        <Choix titre="Place" options={[['encoche', 'Encoche'], ['bas', 'En bas'], ['menu', 'Menu']]} valeur={r.interrupteur} onChoix={(place) => onChange((courant) => ({ ...courant, reglages: deplacer(courant.reglages, place) }))} />
        <Range label="Taille" {...TAILLES[r.interrupteur]} value={r.taille} format={(v) => `${pilule({ interrupteur: r.interrupteur, taille: v }).largeur} × ${v} px`} onChange={(taille) => regler({ taille })} />
        <p className="atelier-panel__note">
          {PLACES[r.interrupteur]} La pilule fait {p.largeur} × {p.hauteur} px ; plus petite que 44 px, elle répond quand même au doigt dans 44 px de haut. La bulle sort de son bouton, où qu’il soit.
        </p>
      </fieldset>

      <fieldset>
        <legend>Se déplacer</legend>
        <Choix titre="Glisser pour revenir" options={OUI_NON} valeur={r.gestes ? 'oui' : 'non'} onChoix={(v) => regler({ gestes: v === 'oui' })} />
        <Choix titre="Pavé de touches" options={OUI_NON} valeur={r.pave ? 'oui' : 'non'} onChoix={(v) => regler({ pave: v === 'oui' })} />
        <Choix titre="Lignes" options={[['lignes', 'Terminal'], ['feuille', 'Feuille']]} valeur={r.rangs} onChoix={(rangs) => regler({ rangs })} />
        <Range label="Cibles" {...BORNES.cible} value={r.cible} format={px} onChange={(cible) => regler({ cible })} />
        {r.pave && <Range label="Touches" {...BORNES.touche} value={r.touche} format={px} onChange={(touche) => regler({ touche })} />}
        <p className="atelier-panel__note">
          Toucher un nom l’ouvre, toujours : chaque ligne du ls est une cible sur toute la largeur. {r.gestes ? 'Glisser vers la droite revient en arrière (à la souris aussi) : il faut partir à plus de 24 px du bord gauche, qui est au navigateur, et rester à peu près à l’horizontale, sinon c’est le fichier qui défile. ' : ''}
          {r.pave ? 'Le pavé, ← ↑ ↓ ↵, pilote le nom surligné comme les flèches sur ordinateur ; dans un fichier, ↑ ↓ font défiler et ↵ passe à la page suivante. ' : ''}
          {RANGS[r.rangs]} Le clavier du téléphone ne sort que si on touche la ligne de commande ; un long fichier défile au doigt dans le terminal, la page derrière ne bouge pas.
        </p>
      </fieldset>

      <fieldset>
        <legend>Le numéro</legend>
        <Choix titre="Place" options={[['etat', 'Ligne d’état'], ['haut', 'En haut'], ['filigrane', 'Filigrane']]} valeur={r.numero} onChoix={(numero) => regler({ numero })} />
        <p className="atelier-panel__note">{NUMEROS[r.numero]}</p>
      </fieldset>

      <fieldset>
        <legend>Le texte</legend>
        <Range label="Corps" {...BORNES.corps} value={r.corps} format={(v) => `${px(v)} · ≈ ${colonnes(v)} col.`} onChange={(corps) => regler({ corps })} />
        <Choix titre="Listes" options={[['courte', 'ls -s'], ['longue', 'ls -l']]} valeur={r.liste} onChoix={(liste) => regler({ liste })} />
        <p className="atelier-panel__note">
          La police de console du téléphone, avec plus d’air entre les lignes que sur ordinateur. Le corps décide du nombre de colonnes (la ligne d’état donne le vrai). « ls -s » n’écrit que le poids et le nom ; « ls -l » ajoute le titre du fichier, coupé là où l’écran finit. Le Markdown est toujours plié à la largeur de l’écran, jamais à 128 colonnes.
        </p>
      </fieldset>

      <fieldset>
        <legend>Le passage</legend>
        <Range label="Durée" {...BORNES.duree} value={r.duree} format={secondes} onChange={(duree) => regler({ duree })} />
        <Range label="Liseré" {...BORNES.largeur} value={r.largeur} format={px} onChange={(largeur) => regler({ largeur })} />
        <Choix titre="Toile" options={[['1', '×1'], ['1.5', '×1,5'], ['2', '×2'], ['3', '×3']]} valeur={String(r.densite)} onChoix={(densite) => regler({ densite: Number(densite) })} />
        <p className="atelier-panel__note">
          La même bulle que sur ordinateur, sur un écran quatre fois plus étroit : 260 px de liseré y noieraient tout, et plus il est large, plus le shader a de surface à calculer. « Toile » plafonne la définition du canevas : ×{virgule(r.densite)} donne {t.largeur} × {t.hauteur} px sur un téléphone à densité 3, au lieu de 1170 × 2532. Sur cet écran-ci, de densité {virgule(Math.round((window.devicePixelRatio || 1) * 100) / 100)}, le plafond ne se voit {(window.devicePixelRatio || 1) > 1 ? 'qu’en partie' : 'pas'} : il se juge sur un vrai téléphone.
        </p>
      </fieldset>

      <fieldset>
        <legend>Le chargement</legend>
        <Choix titre="Quand" options={[['toucher', 'Au premier toucher'], ['repos', 'D’avance, au repos']]} valeur={r.chargement} onChoix={(chargement) => regler({ chargement })} />
        <Choix titre="Réseau simulé" options={[['direct', 'Direct'], ['4g', '+0,4 s'], ['3g', '+1,5 s']]} valeur={reseau} onChoix={onReseau} />
        <div className="m1-tirage">
          <span>{charge}</span>
          <button type="button" onClick={() => onOublier()}>
            Oublier
          </button>
        </div>
        <p className="atelier-panel__note">
          Un doigt ne survole pas : rien n’annonce le premier toucher. Au premier toucher, le bouton glisse tout de suite et la bulle attend que le passage soit arrivé ; d’avance, il est déjà là, sauf pour qui économise ses données ou n’a que la 2G. Un interrupteur dans le menu s’annonce quand le menu s’ouvre. « Réseau simulé » ajoute un délai, pour sentir l’attente ; « Oublier » remet l’établi comme à l’arrivée sur la page.
        </p>
      </fieldset>

      <div className="atelier-panel__footer">
        <button type="button" title="Revenir à ce qui est retenu : encoche, noms et gestes, feuille, numéro en filigrane" onClick={() => onChange(() => CHOIX)}>
          Réinitialiser
        </button>
        <button type="button" onClick={() => copy(resume(etat))}>
          {state === 'copied' ? 'Copié' : state === 'error' ? 'Copie impossible' : 'Copier mes réglages'}
        </button>
      </div>
    </div>
  );
}
