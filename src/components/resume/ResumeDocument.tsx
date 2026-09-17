import { useEffect, useRef, useState } from 'react';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

GlobalWorkerOptions.workerSrc = workerUrl;

export type ResumeLanguage = 'fr' | 'en';

export default function ResumeDocument({ language }: { language: ResumeLanguage }) {
  const pagesRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    const container = pagesRef.current;
    if (!container) return;
    let disposed = false;
    const loading = getDocument({ url: `/CV_${language}.pdf` });

    const render = async () => {
      try {
        const document = await loading.promise;
        for (let index = 1; index <= document.numPages; index += 1) {
          const page = await document.getPage(index);
          if (disposed) return;
          const canvas = window.document.createElement('canvas');
          const viewport = page.getViewport({ scale: 2 });
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          canvas.setAttribute('role', 'img');
          canvas.setAttribute('aria-label', `CV — ${language === 'fr' ? 'Français' : 'English'}, page ${index}`);
          await page.render({ canvas, viewport }).promise;
          if (disposed) return;
          container.append(canvas);
        }
        setStatus('ready');
      } catch {
        if (!disposed) setStatus('error');
      }
    };

    void render();
    return () => {
      disposed = true;
      void loading.destroy();
      container.replaceChildren();
    };
  }, [language]);

  return (
    <div className="resume-preview-document" data-document-status={status}>
      {status === 'loading' && <p role="status">{language === 'fr' ? 'Chargement du CV…' : 'Loading CV…'}</p>}
      {status === 'error' && <p role="alert">{language === 'fr' ? 'L’aperçu est indisponible.' : 'The preview is unavailable.'} <a href={`/CV_${language}.pdf`} target="_blank" rel="noreferrer">{language === 'fr' ? 'Ouvrir le PDF' : 'Open PDF'}</a></p>}
      <div ref={pagesRef} />
    </div>
  );
}
