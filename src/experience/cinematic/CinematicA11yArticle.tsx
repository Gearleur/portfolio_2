import { cinematicScript } from './cinematicScript';
import './cinematic.css';

/*
 * Parade au risque principal d'accessibilite de la cinematique : les phrases
 * du texte anime passent par `opacity: 0` avant d'entrer, ce qui les rend
 * invisibles a un lecteur d'ecran qui suit le DOM sans jouer les
 * transitions. Le texte complet existe donc ici en permanence, hors du flux
 * visuel (`cinematic-a11y` le rend hors-ecran en CSS).
 */
export function CinematicA11yArticle() {
  return (
    <article className="cinematic-a11y">
      <h2>Ce que j&apos;apporte sur l&apos;IA en entreprise</h2>
      {cinematicScript.map((act) => (
        <section key={act.id}>
          {act.lines.map((line) => (
            <p key={line.text}>{line.text}</p>
          ))}
        </section>
      ))}
    </article>
  );
}
