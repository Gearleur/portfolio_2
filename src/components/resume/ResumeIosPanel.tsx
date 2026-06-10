import { resumeDownloads } from '../../data/resume';
import { ResumeDownloadButton } from './ResumeDownloadButton';
import './resume.css';

type ResumeIosPanelProps = {
  onClose: () => void;
};

export function ResumeIosPanel({ onClose }: ResumeIosPanelProps) {
  return (
    <section className="resume-ios-panel" aria-labelledby="resume-ios-heading">
      <header className="resume-ios-nav">
        <button type="button" onClick={onClose}>Portfolio</button>
        <h1 id="resume-ios-heading">CV</h1>
        <button type="button" onClick={onClose}>Done</button>
      </header>

      <div className="resume-ios-content">
        <p className="resume-ios-caption">Choose a resume package to download.</p>

        <section className="resume-ios-card" aria-label="Resume downloads">
          {resumeDownloads.map((download) => (
            <ResumeDownloadButton
              className={`resume-ios-row resume-ios-row--${download.status}`}
              download={download}
              key={download.id}
            >
              <span className="resume-ios-row__icon" aria-hidden="true">PDF</span>
              <span>
                <strong>{download.language}</strong>
                <small>{download.meta}</small>
              </span>
              <b>{download.status === 'available' ? 'Get' : 'Soon'}</b>
            </ResumeDownloadButton>
          ))}
        </section>

        <section className="resume-ios-details" aria-label="Resume details">
          <h2>About this CV</h2>
          <p>
            Downloadable PDF resume with education, professional experience, selected projects,
            technical skills, languages and extracurricular experience.
          </p>
        </section>
      </div>
    </section>
  );
}
