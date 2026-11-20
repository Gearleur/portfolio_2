import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import type { ComponentType, JSX } from 'react';
import { FiltreVerre } from '../../atelier/FiltreVerre';
import { ChoixLangueContext, LangueContext } from '../../atelier/langue';
import type { Langue } from '../../atelier/langue';
import { MaquetteMobile } from '../../atelier/Maquettes';
import { Miniature } from '../../atelier/Miniature';
import { MiniatureAlpine } from '../../atelier/MiniatureAlpine';
import { MiniatureProcessus } from '../../atelier/MiniatureProcessus';
import { MiniatureReunions } from '../../atelier/MiniatureReunions';
import { ProjetMobile } from '../../atelier/Projet';
import { PROJETS } from '../../atelier/projets';
import { Specimen } from '../../atelier/Specimen';
import { PleinEcran } from '../m1/Apercu';
import { fondDe } from '../m1/fond';
import { RETENU as MATIERE } from '../m1/reglages';
import type { Sens } from '../m4/passage';
import { Mobile } from '../m6/Mobile';
import type { Quand } from '../m6/Mobile';
import { Panneau } from '../m6/Panneau';
import type { PassageProps } from '../m6/Passage';
import { PROPOSITIONS, RESEAUX, choisie, etatDe, garder, intacte, lire, pilule, proposition, toile, virgule } from '../m6/reglages';
import type { Reseau } from '../m6/reglages';
import '../../atelier/steps/chemin.css';
import '../m6/m6-etabli.css';

// The Vitrine's paper under the human page; no wave on the bench.
const FOND = fondDe(MATIERE.page);

// The Vitrine's own thumbnails, as its page mounts them.
const IMAGES = {
  '01': <MiniatureAlpine />,
  '02': <Miniature cadrage="paysage" />,
  '03': <MiniatureReunions />,
  '04': <MiniatureProcessus />,
};

/** The phone's page of the Vitrine, as it is: the notch, its menu, the cards. It does not depend on the passage. */
const Humain = memo(function Humain({ menu, onMenu, onOuvrir }: { menu: boolean; onMenu: (ouvert: boolean) => void; onOuvrir: (numero: string) => void }) {
  return <MaquetteMobile blocks={false} glisse variante="notch" menuOpen={menu} onMenu={onMenu} images={IMAGES} onOuvrir={onOuvrir} />;
});

/** What the stage is asked: the side to be on, a moment of the passage to hold, a passage to play again. */
type Lecture = { machine: boolean; fige: number | null; tour: number };

/** What the last passage cost on this machine: its frames, ms between them, and the canvas they were drawn on. */
type Mesure = { images: number; moyenne: number; pire: number; toile: [number, number] };

/** The network the bench pretends to have, and how many times it was asked to forget the passage it had fetched. */
type Session = { reseau: Reseau; n: number };

const ms = (v: number) => `${virgule(Math.round(v * 10) / 10)} ms`;

/**
 * Atelier 2 · M6, le téléphone: the Machine mode on a screen of 390 × 844, without a keyboard,
 * arrows or a pointer to hover with. The phone's own page of the Vitrine on the human side, the
 * switch of M3, the bubble of M4 and the terminal of M5 on the other, all of them the desktop's
 * pieces; three propositions on where the switch lives, how one moves about with a finger and
 * where the number goes, and what the passage may weigh: its canvas's density, its rim, and when
 * it is fetched.
 */
export function M6Deplacer(): JSX.Element {
  const [etat, setEtat] = useState(lire);
  const [lecture, setLecture] = useState<Lecture>({ machine: false, fige: null, tour: 0 });
  const [ouvert, setOuvert] = useState(false);
  const [menu, setMenu] = useState(false);
  const [langue, setLangue] = useState<Langue>('fr');
  // The project page being read, if a card was touched: its notch holds « ‹ Projets » in place of the name, and the terminal opens on its file.
  const [numero, setNumero] = useState<string>();
  const ouvrir = useCallback((n: string) => setNumero(PROJETS[n] ? n : undefined), []);
  const revenir = useCallback(() => setNumero(undefined), []);
  const projet = numero ? PROJETS[numero] : undefined;
  const [session, setSession] = useState<Session>({ reseau: 'direct', n: 0 });
  const [charge, setCharge] = useState<{ quand: Quand; ms: number } | null>(null);
  const [mesure, setMesure] = useState<Mesure | null>(null);
  const fermer = useCallback(() => setOuvert(false), []);

  useEffect(() => garder(etat), [etat]);

  // The switch: the passage leaves from where the stage is.
  const basculer = useCallback((machine: boolean) => setLecture((l) => ({ ...l, machine, fige: null })), []);
  // The bench: the passage again, from its start.
  const jouer = useCallback((sens: Sens) => setLecture((l) => ({ machine: sens === 'aller', fige: null, tour: l.tour + 1 })), []);
  const figer = useCallback((fige: number) => setLecture((l) => ({ ...l, fige })), []);

  // The fetch of the passage, behind the delay of the pretended network; asked several times, it is one fetch.
  const charger = useMemo(() => {
    let demande: Promise<ComponentType<PassageProps>> | null = null;
    const attente = RESEAUX[session.reseau];
    return () =>
      (demande ??= new Promise<void>((suite) => window.setTimeout(suite, attente)).then(() => import('../m6/Passage')).then((module) => module.Passage));
  }, [session]);
  const noter = useCallback((quand: Quand, duree: number) => setCharge({ quand, ms: duree }), []);

  // As on arriving on the page: the human side, and nothing fetched yet.
  const oublier = useCallback((reseau?: Reseau) => {
    setSession((s) => ({ reseau: reseau ?? s.reseau, n: s.n + 1 }));
    setLecture((l) => ({ ...l, machine: false, fige: null }));
    setCharge(null);
  }, []);

  const { machine, fige, tour } = lecture;

  // What the passage costs here: the frames this browser drew while it lasted.
  useEffect(() => {
    if (fige !== null) return;
    let image = 0;
    let dernier = 0;
    const ecarts: number[] = [];
    const debut = performance.now();
    const pas = (t: number) => {
      const scene = document.querySelector('.m6-scene');
      if (scene?.hasAttribute('data-passage')) {
        if (dernier) ecarts.push(t - dernier);
        dernier = t;
      } else if (dernier) {
        const bulle = scene?.querySelector<HTMLCanvasElement>('.m4-bulle');
        if (ecarts.length) setMesure({ images: ecarts.length + 1, moyenne: ecarts.reduce((a, b) => a + b, 0) / ecarts.length, pire: Math.max(...ecarts), toile: [bulle?.width ?? 0, bulle?.height ?? 0] });
        return;
      } else if (t - debut > 4000) return;
      image = requestAnimationFrame(pas);
    };
    image = requestAnimationFrame(pas);
    return () => cancelAnimationFrame(image);
  }, [machine, tour, fige]);

  const r = etat.reglages;
  const telle = intacte(r);
  const p = pilule(r);
  const t = toile(r.densite);
  const arrivee = charge ? (charge.quand === 'repos' ? 'Passage chargé d’avance, au repos' : `Passage chargé au toucher, ${Math.round(charge.ms)} ms d’attente`) : 'Passage pas encore chargé';

  const telephone = (
    <div className="phone__frame m6-cadre">
      <Specimen settings={FOND}>
        <LangueContext.Provider value={langue}>
          <ChoixLangueContext.Provider value={setLangue}>
            {projet ? <ProjetMobile key={numero} projet={projet} variante="notch" onRetour={revenir} menuOpen={menu} onMenu={setMenu} /> : <Humain menu={menu} onMenu={setMenu} onOuvrir={ouvrir} />}
            <Mobile key={session.n} reglages={r} machine={machine} onMode={basculer} langue={langue} numero={numero} adresse={numero ?? ''} menu={menu} charger={charger} onCharge={noter} fige={fige} tour={tour} />
          </ChoixLangueContext.Provider>
        </LangueContext.Provider>
      </Specimen>
    </div>
  );
  const panneau = <Panneau etat={etat} onChange={setEtat} machine={machine} fige={fige} onJouer={jouer} onFiger={figer} reseau={session.reseau} onReseau={oublier} charge={arrivee} onOublier={oublier} />;
  const rejouer = (
    <button type="button" onClick={() => jouer(machine ? 'aller' : 'retour')}>
      Rejouer <span aria-hidden="true">↻</span>
    </button>
  );

  return (
    <section className="atelier-step m6-etabli" aria-labelledby="etape-m6">
      <FiltreVerre />
      <header className="atelier-step__head">
        <span className="atelier-step__index">M6</span>
        <h2 id="etape-m6">Le téléphone</h2>
        <span className="atelier-status">À décider</span>
      </header>
      <p className="atelier-step__note">
        Le mode Machine sur un écran de 390 × 844 : ni clavier, ni flèches, ni survol, une quarantaine de colonnes et pas de place pour une bande à gauche. Le
        téléphone ci-contre est à sa taille réelle, avec la vraie page téléphone de la Vitrine côté Humain ; l’interrupteur, la bulle, le terminal et les textes
        sont ceux de l’ordinateur, et tout marche au doigt comme à la souris. Trois propositions pour partir : elles diffèrent sur la place de l’interrupteur, la
        façon de se déplacer et la place de ton numéro, et chaque partie se prend à une autre. L’établi s’ouvre sur ce qui est retenu : l’interrupteur dans
        l’encoche, les noms et le glissé vers la droite ensemble, les listes en feuille, ton numéro en filigrane derrière les lignes. Touche une carte pour voir l’encoche d’une page
        projet. Le clavier du téléphone ne sort que si on touche la ligne de commande. En bas du panneau, ce qui ne se voit pas mais pèse : la définition de la toile, la largeur du liseré, et le moment où le passage se charge.
      </p>

      <div className="atelier-builder">
        {panneau}
        <div className="atelier-stage m6-plan">
          {/* In full screen the phone runs there, not twice. */}
          {!ouvert && telephone}
          <div className="atelier-stage__bar">
            <p>
              {choisie(r) ? 'Retenu' : telle ? `« ${telle.nom} »` : `« ${proposition(etat.depart).nom} », réglée`} · {numero ? 'page projet' : 'accueil'}, côté {machine ? 'Machine' : 'Humain'}
              {fige === null ? '' : ', figé'} · pilule {p.largeur} × {p.hauteur} px · toile ×{virgule(r.densite)}, soit {t.largeur} × {t.hauteur} px sur un téléphone à
              densité 3 · {arrivee}
              {mesure ? ` · dernier passage ici : ${mesure.images} images sur une toile de ${mesure.toile[0]} × ${mesure.toile[1]} px, ${ms(mesure.moyenne)} entre deux, ${ms(mesure.pire)} au pire` : ''}
            </p>
            <div>
              {rejouer}
              <button type="button" onClick={() => setOuvert(true)}>
                Plein écran <span aria-hidden="true">↗</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {ouvert && (
        <PleinEcran
          fond={FOND}
          choix={PROPOSITIONS.map((prop) => ({ nom: prop.nom, pari: prop.pari, active: prop === telle, prendre: () => setEtat(etatDe(prop.id)) }))}
          panneau={panneau}
          outils={rejouer}
          onClose={fermer}
        >
          <div className="m6-plein">{telephone}</div>
        </PleinEcran>
      )}
    </section>
  );
}
