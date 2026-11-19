import { useCopyText } from '../../../shared/hooks/useCopyText';
import { Range } from '../../atelier/controls';
import { BORNES, PROPOSITIONS, etatDe, intacte, nomVitesse, proposition, resume } from './reglages';
import type { Etat, Reglages } from './reglages';

/*
 * The bench's panel (step M5), made like M1's and M2's: the propositions to start from, then
 * every aid as a switch of its own, so that the cursor between « vrai terminal » and « user
 * friendly » can be placed by hand.
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

const OUI_NON: [boolean, string][] = [
  [false, 'Non'],
  [true, 'Oui'],
];

export function Panneau({ etat, onChange }: { etat: Etat; onChange: Maj }) {
  const { copy, state } = useCopyText();
  const r = etat.reglages;
  const telle = intacte(r);
  const regler = (patch: Partial<Reglages>) => onChange((courant) => ({ ...courant, reglages: { ...courant.reglages, ...patch } }));

  return (
    <div className="atelier-panel">
      <fieldset>
        <legend>Propositions</legend>
        <div className="atelier-presets">
          {PROPOSITIONS.map((p) => (
            <button key={p.id} type="button" aria-pressed={p === telle} title={p.pari} onClick={() => onChange(() => etatDe(p.id))}>
              <span className="m5-glyphe" data-id={p.id} />
              {p.nom}
            </button>
          ))}
        </div>
        <p className={telle ? 'atelier-panel__note m1-pari' : 'atelier-panel__note'}>{telle ? telle.pari : `Partie de « ${proposition(etat.depart).nom} », réglée à la main.`}</p>
      </fieldset>

      <fieldset>
        <legend>L’aide</legend>
        <Choix titre="Sélection" options={[['aucune', 'Aucune'], ['inverse', 'Inverse'], ['chevron', 'Chevron']]} valeur={r.selection} onChoix={(selection) => regler({ selection })} />
        <p className="atelier-panel__note">
          {r.selection === 'aucune'
            ? 'Comme dans un shell : ↑ ↓ rappellent l’historique, ← → déplacent le curseur dans la ligne.'
            : 'Ligne vide : ↑ ↓ choisissent un nom, ↵ ou → l’ouvrent, ← ou Retour arrière reviennent ; dans un fichier, ↑ ↓ et Espace font défiler. L’historique reste sur Ctrl+P et Ctrl+N.'}
        </p>
        <Choix titre="Commande proposée" options={OUI_NON} valeur={r.suggestion} onChoix={(suggestion) => regler({ suggestion })} />
        <Choix titre="Barre de touches" options={OUI_NON} valeur={r.touches} onChoix={(touches) => regler({ touches })} />
        <Choix titre="Retour" options={[['aucun', 'Aucun'], ['entree', '../'], ['fleche', 'Flèche'], ['fil', 'Fil']]} valeur={r.retour} onChoix={(retour) => regler({ retour })} />
        <Choix titre="Re-lister" options={OUI_NON} valeur={r.relister} onChoix={(relister) => regler({ relister })} />
        <p className="atelier-panel__note">
          La commande proposée s’écrit en gris après l’invite (il faut une sélection). « ../ » met le retour parmi les noms ; « Re-lister » rend la liste du dossier sous chaque fichier lu.
        </p>
      </fieldset>

      <fieldset>
        <legend>L’écriture</legend>
        <Range label="Vitesse" {...BORNES.vitesse} value={r.vitesse} format={nomVitesse} onChange={(vitesse) => regler({ vitesse })} />
        <Choix titre="Réponse" options={[['ligne', 'Ligne à ligne'], ['coup', 'D’un coup']]} valeur={r.sortie} onChoix={(sortie) => regler({ sortie })} />
        <Choix titre="Commande" options={[['suite', 'À la suite'], ['neuf', 'Écran neuf']]} valeur={r.ecran} onChoix={(ecran) => regler({ ecran })} />
        <p className="atelier-panel__note">La vitesse est celle d’une commande qui s’écrit seule, après un clic ou une flèche. « Écran neuf » : chaque commande repart du haut de l’écran, le reste se retrouve en remontant. Mouvement réduit : tout arrive d’un coup.</p>
      </fieldset>

      <fieldset>
        <legend>Le texte</legend>
        <Choix titre="Invite" options={[['signe', '$'], ['chemin', '~/fr $']]} valeur={r.invite} onChoix={(invite) => regler({ invite })} />
        <Choix titre="Listes" options={[['ligne', 'ls'], ['longue', 'ls -l']]} valeur={r.liste} onChoix={(liste) => regler({ liste })} />
        <Range label="Pliage" {...BORNES.pliage} value={r.pliage} format={(v) => `${v} col.`} onChange={(pliage) => regler({ pliage })} />
        <Choix titre="Markdown" options={[['brut', 'Brut'], ['agence', 'Agencé']]} valeur={r.markdown} onChoix={(markdown) => regler({ markdown })} />
        <Choix titre="Numéros" options={OUI_NON} valeur={r.numeros} onChoix={(numeros) => regler({ numeros })} />
        <p className="atelier-panel__note">Brut, le Markdown garde ses signes ; agencé, ses titres sont soulignés, ses listes ont des puces, ses amorces sont en gras et ses images ne sont pas citées. Plié aux espaces, jamais plus large que l’écran. Les numéros sont ceux de « cat -n ».</p>
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
