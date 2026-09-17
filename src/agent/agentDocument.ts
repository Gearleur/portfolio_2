import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MachineResumeDocument } from '../components/machine/MachineResumeDocument';
import { AgentAccess } from './AgentAccess';
import { getAgentContext, getAgentMarkdown, getAgentProfile } from './agentContent';

export function getAgentHtml() {
  const data = getAgentProfile();
  const person = {
    '@context': 'https://schema.org', '@type': 'Person', name: data.name,
    jobTitle: data.role, description: data.summary, email: data.contact.email,
    sameAs: [data.contact.linkedin, data.contact.github],
  };
  const document = renderToStaticMarkup(createElement(MachineResumeDocument, {
    expandProjects: true,
    showAgentLink: false,
    beforeSections: createElement(AgentAccess),
  }));

  return `<!doctype html>
<html lang="en" data-portfolio-mode="machine">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta name="description" content="Alexandre Teixeira — AI engineer. Complete machine-readable CV, copyable context and JSON profile.">
  <meta name="theme-color" content="#090909">
  <title>Alexandre Teixeira · Agent profile</title>
  <link rel="icon" type="image/svg+xml" href="/assets/pwa-icon.svg">
  <link rel="preload" href="/fonts/DepartureMono-Regular.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="/agent/style.css">
  <link rel="alternate" type="text/markdown" href="/agent/profile.md" title="Profile as Markdown">
  <link rel="alternate" type="application/json" href="/agent/profile.json" title="Structured profile">
  <link rel="describedby" type="text/plain" href="/llms.txt">
  <script type="application/ld+json">${JSON.stringify(person).replace(/</g, '\\u003c')}</script>
  <script src="/agent/copy.js" defer></script>
</head>
<body class="agent-page">
  <a class="agent-skip-link" href="#profile">Skip to profile</a>
  <main id="profile" class="machine-resume" aria-labelledby="machine-resume-title">
    <div class="machine-resume__rail machine-resume__rail--left" aria-hidden="true"></div>
    <div class="machine-resume__rail machine-resume__rail--right" aria-hidden="true"></div>
    <button id="copy-context" class="machine-copy-button" type="button" aria-label="Copy prompt and complete profile" hidden>
      <svg viewBox="0 0 16 16" aria-hidden="true"><rect x="5" y="5" width="8" height="9" rx="1"/><path d="M3 11H2.8A.8.8 0 0 1 2 10.2V2.8A.8.8 0 0 1 2.8 2h7.4a.8.8 0 0 1 .8.8V3"/></svg>
      <span data-copy-label>Copy all</span>
    </button>
    ${document}
  </main>
  <nav class="portfolio-mode-toggle portfolio-mode-toggle--machine agent-human-navigation" aria-label="Return to portfolio">
    <a class="portfolio-mode-toggle__option agent-human-link" href="/" aria-label="Return to the human interface"><span>← Human interface</span></a>
  </nav>
</body>
</html>`;
}

const copyScript = `
const button = document.getElementById('copy-context');
const status = document.getElementById('copy-status');
const fallback = document.getElementById('copy-fallback');
const resets = new WeakMap();
button.hidden = false;
let contextText = null;
async function loadContext() {
  if (contextText !== null) return contextText;
  const response = await fetch('/agent/context.txt', { signal: AbortSignal.timeout(10000) });
  if (!response.ok) throw new Error(response.status === 429 ? 'Rate limited' : 'Profile unavailable');
  contextText = await response.text();
  return contextText;
}
async function copyText(text, source, message) {
  const label = source.querySelector('[data-copy-label]') || source;
  const original = source.dataset.originalLabel || label.textContent;
  source.dataset.originalLabel = original;
  clearTimeout(resets.get(source));
  try {
    await navigator.clipboard.writeText(text);
    status.textContent = message;
    label.textContent = 'Copied';
    fallback.hidden = true;
    resets.set(source, setTimeout(() => { label.textContent = original; }, 1800));
  } catch {
    label.textContent = original;
    fallback.value = text;
    fallback.hidden = false;
    fallback.focus();
    fallback.select();
    status.textContent = 'Select and copy the text below, or open the plain-text links.';
  }
}
button.addEventListener('click', async () => {
  button.disabled = true;
  status.textContent = 'Preparing your context…';
  try {
    await copyText(await loadContext(), button, 'Prompt and complete profile copied. Ready to paste.');
  } catch {
    status.textContent = 'Unable to load the profile. Retry or use the plain-text links.';
  } finally {
    button.disabled = false;
  }
});
for (const code of document.querySelectorAll('[data-command-path]')) {
  const url = new URL(code.dataset.commandPath, location.origin).href.replaceAll("'", '%27');
  code.textContent = "curl -fsSL '" + url + "'";
}
for (const commandButton of document.querySelectorAll('[data-copy-command]')) {
  commandButton.hidden = false;
  commandButton.addEventListener('click', async () => {
    commandButton.disabled = true;
    await copyText(document.getElementById(commandButton.dataset.copyCommand).textContent, commandButton, 'Command copied. Ready to run in your terminal.');
    commandButton.disabled = false;
  });
}
`;

export function getAgentFiles(style: string): Record<string, { type: string; content: string }> {
  return {
    '/agent.html': { type: 'text/html', content: getAgentHtml() },
    '/agent/index.html': { type: 'text/html', content: getAgentHtml() },
    '/agent/profile.md': { type: 'text/markdown', content: getAgentMarkdown() },
    '/agent/profile.json': { type: 'application/json', content: JSON.stringify(getAgentProfile(), null, 2) },
    '/agent/context.txt': { type: 'text/plain', content: getAgentContext() },
    '/agent/style.css': { type: 'text/css', content: style },
    '/agent/copy.js': { type: 'text/javascript', content: copyScript },
    '/llms.txt': { type: 'text/plain', content: `# Alexandre Teixeira\n\n> AI engineer building AI products from business needs to production. Self-authored profile based on the English and French CVs.\n\n## Profile\n\n- [Agent profile](/agent/): Full profile in static HTML, readable without JavaScript.\n- [Profile as Markdown](/agent/profile.md): Experience, education, projects, skills and sources.\n- [Structured profile](/agent/profile.json): The same profile as JSON.\n- [Conversation context](/agent/context.txt): An optional introduction prompt followed by the profile.\n\n## Sources\n\n- [English CV](/CV_en.pdf)\n- [French CV](/CV_fr.pdf)\n- [Human portfolio](/)\n` },
  };
}
