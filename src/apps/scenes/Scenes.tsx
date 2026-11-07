import type { CSSProperties, ReactNode } from 'react';
import { ChatBar } from '../../shared/mikky-ui/ChatBar';
import { Icon } from '../../shared/mikky-ui/Icon';
import fondAffiche from '../atelier/medias/whiteboard-amdec-fond.webp';
import { MiniatureAlpine } from '../atelier/MiniatureAlpine';
import { Feuille } from '../atelier/alpine-scene/Feuille';
import { DOSSIER, MODELE, QUESTION } from '../atelier/alpine-scene/texte';

/*
 * The scenes of the Whiteboard AMDEC thumbnail, each one still, on a page of
 * its own (journal n° 101): a blurred background, Mikky's chat, the
 * whiteboard and its table, the agents' cursors. They are animated next, and
 * this page goes once they are. Each scene is drawn once at 640 × 360 and
 * scales to the desktop card and the phone card.
 */

type Etat = 'vide' | 'saisie' | 'envoi';

/** Mikky's chat window: a bare chevron, the welcome or the thread, the bar. */
function Chat({ etat }: { etat: Etat }) {
  const envoi = etat === 'envoi';
  return (
    <div className={`sc-chat ${envoi ? 'sc-chat--haut' : ''} mk-island`}>
      <span className="sc-chevron" aria-hidden="true">
        <Icon name="back" />
      </span>
      {envoi ? (
        <div className="mk-thread">
          <div className="mk-user">
            <span className="mk-bubble">{QUESTION}</span>
            <div className="mk-time">14:00</div>
          </div>
          <p className="mk-agent">Je lance l’analyse AMDEC du lève-vitre de l’A110.</p>
          <div className="mk-tool">
            <Icon name="sparkle" />
            Lit leve-vitre.xlsx
            <Icon name="right" />
          </div>
          <div className="mk-tool mk-tool--now" style={{ '--c': 'var(--blue)' } as CSSProperties}>
            <Icon name="sparkle" />
            Construit le tableau
            <Icon name="right" />
          </div>
        </div>
      ) : (
        <div className="sc-accueil">Qu’est-ce qu’on lance ?</div>
      )}
      <ChatBar
        text={etat === 'saisie' ? QUESTION : undefined}
        placeholder={envoi ? 'Écris à cet agent…' : 'Que doit faire l’agent ?'}
        caret={etat === 'saisie'}
        folder={envoi ? undefined : DOSSIER}
        model={envoi ? undefined : MODELE}
      />
    </div>
  );
}

const SCENES: { id: string; titre: string; note: string; contenu: ReactNode }[] = [
  {
    id: '1',
    titre: 'Le chat, vide',
    note: 'Le début : la barre de Mikky, dans le dossier alpine A110, avec deepseek 4.1.',
    contenu: <Chat etat="vide" />,
  },
  {
    id: '2',
    titre: 'Le chat, la question tapée',
    note: 'Quelqu’un a tapé la question, prête à partir.',
    contenu: <Chat etat="saisie" />,
  },
  {
    id: '3',
    titre: 'L’envoi',
    note: 'La question est partie : une bulle pour toi, du texte sans bulle pour l’agent, ses actions en dessous.',
    contenu: <Chat etat="envoi" />,
  },
  {
    id: '4',
    titre: 'Le tableau blanc',
    note: 'Le chat est parti, le tableau arrive : la feuille AMDEC.xlsx, encore vide.',
    contenu: <Feuille />,
  },
  {
    id: '5',
    titre: 'Le tableau se remplit',
    note: 'La feuille est remplie : on ne lit pas ce qu’elle dit, on voit sa forme, ses étiquettes et ses états de couleur.',
    contenu: <Feuille contenu />,
  },
  {
    id: '6',
    titre: 'Les agents au travail',
    note: 'Des curseurs de couleurs différentes remplissent le tableau : une cellule chacun.',
    contenu: <Feuille contenu curseurs />,
  },
];

function FondScene() {
  return (
    <>
      <img className="sc-fond" src={fondAffiche} alt="" />
      <div className="sc-voile" />
    </>
  );
}

function Cadre({ children, className }: { children: ReactNode; className: string }) {
  return (
    <div className={`sc-cadre ${className}`}>
      <div className="sc-scene mk">
        <FondScene />
        {children}
      </div>
    </div>
  );
}

export function Scenes() {
  return (
    <main className="sc-page">
      <header>
        <h1>Whiteboard AMDEC : les scènes</h1>
        <p>
          Page de travail, à supprimer ensuite. Chaque scène est dessinée une fois et se met à l’échelle : à gauche la
          carte desktop, à droite la carte téléphone.
        </p>
      </header>

      {SCENES.map(({ id, titre, note, contenu }) => (
        <section key={id} className="sc-section">
          <h2>
            <span>{id}</span> {titre}
          </h2>
          <p>{note}</p>
          <div className="sc-paire">
            <Cadre className="sc-cadre--desktop">{contenu}</Cadre>
            <Cadre className="sc-cadre--mobile">{contenu}</Cadre>
          </div>
        </section>
      ))}

      <section className="sc-section">
        <h2>
          <span>▶</span> Le film, de bout en bout
        </h2>
        <p>Les scènes enchaînées sur la miniature : l’affiche, le chat, la feuille, puis l’affiche de nouveau. 22 s, en boucle.</p>
        <div className="sc-paire">
          <div className="sc-cadre sc-cadre--desktop">
            <MiniatureAlpine />
          </div>
          <div className="sc-cadre sc-cadre--mobile">
            <MiniatureAlpine />
          </div>
        </div>
      </section>
    </main>
  );
}
