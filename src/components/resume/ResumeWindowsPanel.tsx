import { resumeDownloads } from '../../data/resume';
import { ResumeDownloadButton } from './ResumeDownloadButton';
import './resume.css';

export function ResumeWindowsPanel() {
  return (
    <section className="resume-windows-panel" aria-labelledby="resume-windows-heading">
      <header className="resume-windows-toolbar" aria-hidden="true">
        <span>File</span>
        <span>Edit</span>
        <span>View</span>
        <span>Favorites</span>
        <span>Tools</span>
        <span>Help</span>
      </header>

      <div className="resume-windows-address">
        <span>Address</span>
        <strong>C:\Documents and Settings\Alexandre\Desktop\CV</strong>
      </div>

      <div className="resume-windows-layout">
        <aside className="resume-windows-sidebar">
          <section>
            <h2>File and Folder Tasks</h2>
            <button type="button">Download selected file</button>
            <button type="button">Send this file by email</button>
            <button type="button">Copy this file</button>
          </section>

          <section>
            <h2>Details</h2>
            <p>Curriculum Vitae</p>
            <p>2 language packages</p>
            <p>PDF format</p>
          </section>
        </aside>

        <main className="resume-windows-main">
          <div>
            <p className="resume-windows-kicker">Resume Downloader</p>
            <h1 id="resume-windows-heading">Choose a CV version</h1>
          </div>

          <div className="resume-windows-files">
            {resumeDownloads.map((download) => (
              <article
                className={`resume-windows-file resume-windows-file--${download.status}`}
                key={download.id}
              >
                <div className="resume-windows-file__icon" aria-hidden="true">
                  <span>PDF</span>
                </div>

                <div className="resume-windows-file__content">
                  <h2>{download.fileName}</h2>
                  <p>{download.meta}</p>
                  <p>{download.description}</p>
                </div>

                <ResumeDownloadButton className="resume-windows-file__button" download={download}>
                  {download.status === 'available' ? 'Download' : 'Missing PDF'}
                </ResumeDownloadButton>
              </article>
            ))}
          </div>
        </main>
      </div>
    </section>
  );
}
