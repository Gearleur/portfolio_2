import { lazy, Suspense, useState } from 'react';
import { RetroWindow } from '../desktop/RetroWindow';
import type { DesktopWindowControllerProps } from '../desktop/RetroWindow';
import './resume.css';
import type { ResumeLanguage } from './ResumeDocument';

type ResumeWindowProps = DesktopWindowControllerProps;
const ResumeDocument = lazy(() => import('./ResumeDocument'));

export function ResumeWindow(props: ResumeWindowProps) {
  const [language, setLanguage] = useState<ResumeLanguage>('fr');

  return (
    <RetroWindow
      {...props}
      iconSelector=".system-file--resume img"
      ariaLabel="Aperçu du CV"
      bodyClassName="retro-window__body--resume-preview"
      title="Curriculum Vitae"
    >
      <div className="resume-preview-toolbar">
        <label>
          Version
          <select aria-label="Langue du CV" value={language} onChange={(event) => setLanguage(event.target.value === 'en' ? 'en' : 'fr')}>
            <option value="fr">Français</option>
            <option value="en">English</option>
          </select>
        </label>
        <a href={`/cv/${language}/`}>Voir la page du CV ↗</a>
        <a href={`/CV_${language}.pdf`} download>Télécharger le PDF ↗</a>
      </div>
      <Suspense fallback={<p role="status">Chargement du CV…</p>}>
        <ResumeDocument key={language} language={language} />
      </Suspense>
    </RetroWindow>
  );
}
