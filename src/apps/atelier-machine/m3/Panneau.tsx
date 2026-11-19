import { useCopyText } from '../../../shared/hooks/useCopyText';
import { Range } from '../../atelier/controls';
import { BORNES, PROPOSITIONS, etatDe, fois, geometrie, intacte, pourcent, proposition, resume } from './reglages';
import type { Etat, Reglages } from './reglages';

/*
 * The bench's panel (step M3), made like M5's: the three propositions to start from, then the
 * object, its window and its coquelicot, its words, its place and its gesture, each within
 * narrow bounds.
 */

type Maj = (maj: (etat: Etat) => Etat) => void;

/** One of a few values. */
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

const px = (v: number) => `${v} px`;

const FENETRES: Record<Reglages['fenetre'], string> = {
  petale: 'Un seul dégradé, fixe sous le bouton : papier, coquelicot, nuit du terminal. La part de coquelicot est la largeur du rouge.',
  judas: 'Ce qu’il y a de l’autre côté : des lignes de terminal vues depuis la page, le titre en serif vu depuis le terminal. La part de coquelicot est la lueur dans la fente, près du bouton.',
  coulee: 'Un creux sombre, qui se remplit derrière le bouton à mesure qu’il glisse. La part de coquelicot va de la braise au rouge plein.',
};

export function Panneau({ etat, onChange }: { etat: Etat; onChange: Maj }) {
  const { copy, state } = useCopyText();
  const r = etat.reglages;
  const telle = intacte(r);
  const { reserve } = geometrie(r);
  const regler = (patch: Partial<Reglages>) => onChange((courant) => ({ ...courant, reglages: { ...courant.reglages, ...patch } }));

  return (
    <div className="atelier-panel">
      <fieldset>
        <legend>Propositions</legend>
        <div className="atelier-presets">
          {PROPOSITIONS.map((p) => (
            <button key={p.id} type="button" aria-pressed={p === telle} title={p.pari} onClick={() => onChange(() => etatDe(p.id))}>
              <span className="m3-glyphe" data-id={p.id} />
              {p.nom}
            </button>
          ))}
        </div>
        <p className={telle ? 'atelier-panel__note m1-pari' : 'atelier-panel__note'}>{telle ? telle.pari : `Partie de « ${proposition(etat.depart).nom} », réglée à la main.`}</p>
      </fieldset>

      <fieldset>
        <legend>L’objet</legend>
        <Range label="Largeur" {...BORNES.largeur} value={r.largeur} format={px} onChange={(largeur) => regler({ largeur })} />
        <Range label="Hauteur" {...BORNES.hauteur} value={r.hauteur} format={px} onChange={(hauteur) => regler({ hauteur })} />
        <Range label="Échelle" {...BORNES.echelle} value={r.echelle} format={(v) => `${fois(v)} · ${Math.round(r.largeur * v)} × ${Math.round(r.hauteur * v)}`} onChange={(echelle) => regler({ echelle })} />
        <Range label="Rayon" {...BORNES.rayon} value={r.rayon} format={pourcent} onChange={(rayon) => regler({ rayon })} />
        <Range label="Relief" {...BORNES.relief} value={r.relief} format={fois} onChange={(relief) => regler({ relief })} />
        <Choix titre="Matière" options={[['ceramique', 'Céramique'], ['verre', 'Verre'], ['mat', 'Mat']]} valeur={r.matiere} onChoix={(matiere) => regler({ matiere })} />
        <p className="atelier-panel__note">Le rayon est une part de la demi-hauteur : 100 %, une pilule pleine. Le relief est la profondeur des ombres du bouton et du creux.</p>
      </fieldset>

      <fieldset>
        <legend>La fenêtre et le coquelicot</legend>
        <Choix titre="Fenêtre" options={[['petale', 'Pétale'], ['judas', 'Judas'], ['coulee', 'Coulée']]} valeur={r.fenetre} onChoix={(fenetre) => regler({ fenetre })} />
        <Range label="Coquelicot" {...BORNES.coquelicot} value={r.coquelicot} format={pourcent} onChange={(coquelicot) => regler({ coquelicot })} />
        <Choix titre="Bouton" options={[['rond', 'Rond'], ['cube', 'Cube côté Machine']]} valeur={r.forme} onChoix={(forme) => regler({ forme })} />
        <p className="atelier-panel__note">{FENETRES[r.fenetre]}</p>
      </fieldset>

      <fieldset>
        <legend>Les mots</legend>
        <Choix titre="Porte" options={[['mot', 'Mot'], ['signe', 'Signe'], ['chiffre', '0 / 1'], ['rien', 'Rien']]} valeur={r.porte} onChoix={(porte) => regler({ porte })} />
        <Choix titre="Libellés" options={[['aucun', 'Aucun'], ['cotes', 'Côtés'], ['fenetre', 'Fenêtre']]} valeur={r.libelles} onChoix={(libelles) => regler({ libelles })} />
        <p className="atelier-panel__note">« Porte » est ce que le bouton porte : le nom du mode, un signe (Aa, &gt;_), 0 / 1 ou rien. « Humain » s’écrit dans le serif de la page, « Machine » dans la police du terminal. Dans la fenêtre, le mot est celui du mode où l’on est ; le judas, lui, nomme l’autre côté.</p>
      </fieldset>

      <fieldset>
        <legend>La place</legend>
        <Range label="Bas" {...BORNES.bas} value={r.bas} format={px} onChange={(bas) => regler({ bas })} />
        <Choix titre="Terminal" options={[['arret', 'S’arrête au-dessus'], ['dessous', 'Passe dessous']]} valeur={r.terminal} onChoix={(terminal) => regler({ terminal })} />
        <p className="atelier-panel__note">
          {r.terminal === 'arret'
            ? `L’écran du terminal rend ${reserve} px en bas : sa dernière ligne (touches, état) se pose juste au-dessus de la pilule, la lame de verre descend toujours jusqu’en bas.`
            : 'Le terminal reste comme à M5 : la pilule recouvre le milieu de sa dernière ligne et les lignes au-dessus. À voir pour comparer, pas à garder.'}
        </p>
      </fieldset>

      <fieldset>
        <legend>Le geste</legend>
        <Range label="Durée" {...BORNES.duree} value={r.duree} format={(v) => `${v} ms`} onChange={(duree) => regler({ duree })} />
        <Range label="Élasticité" {...BORNES.elasticite} value={r.elasticite} format={pourcent} onChange={(elasticite) => regler({ elasticite })} />
        <Choix titre="Vibration" options={[[false, 'Non'], [true, 'Oui']]} valeur={r.vibration} onChoix={(vibration) => regler({ vibration })} />
        <p className="atelier-panel__note">L’élasticité est l’élan du bouton, qui s’écrase contre le bout de la pilule sans en sortir. La vibration ne se sent que sur les téléphones qui la permettent (pas iOS). Mouvement réduit : le bouton change de côté sans glisser.</p>
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
