import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import ResumeDocument from './components/resume/ResumeDocument';
import './components/resume/cvPage.css';

const container = document.getElementById('cv-document');
if (container) {
  const language = container.dataset.language === 'en' ? 'en' : 'fr';
  createRoot(container).render(<StrictMode><ResumeDocument language={language} /></StrictMode>);
}
