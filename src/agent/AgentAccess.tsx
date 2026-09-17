import React from 'react';
import { agentPrompt } from './agentContent';

export function AgentAccess(): React.JSX.Element {
  return (
    <section className="machine-section agent-access" aria-labelledby="agent-access-title">
      <h2 id="agent-access-title"><span>##</span> AGENT_ACCESS</h2>
      <p className="machine-comment">// Complete profile. Copy it, read it, or fetch it in one request.</p>

      <nav className="machine-resume__links" aria-label="Profile formats">
        <a href="/agent/profile.md">[PROFILE.MD]</a>
        <a href="/agent/profile.json">[PROFILE.JSON]</a>
        <a href="/agent/context.txt">[PROMPT + PROFILE.TXT]</a>
      </nav>

      <div className="agent-command">
        <p className="machine-comment">// Introduction prompt + all information</p>
        <pre className="machine-json"><code id="context-command" data-command-path="/agent/context.txt">{'curl -fsSL "$PORTFOLIO_URL/agent/context.txt"'}</code></pre>
        <button className="agent-copy-command" data-copy-command="context-command" type="button" hidden>Copy text command</button>
      </div>
      <div className="agent-command">
        <p className="machine-comment">// Structured profile · GET /agent/profile.json · no API key</p>
        <pre className="machine-json"><code id="json-command" data-command-path="/agent/profile.json">{'curl -fsSL "$PORTFOLIO_URL/agent/profile.json"'}</code></pre>
        <button className="agent-copy-command" data-copy-command="json-command" type="button" hidden>Copy JSON command</button>
      </div>
      <noscript><p className="machine-comment">Set PORTFOLIO_URL to this site’s origin before running these commands.</p></noscript>

      <details className="agent-prompt">
        <summary>Read the introduction prompt</summary>
        <p className="agent-prompt__text">{agentPrompt}</p>
      </details>
      <p id="copy-status" className="agent-copy-status" role="status" aria-live="polite" />
      <textarea id="copy-fallback" aria-label="Text to copy manually" readOnly hidden />
    </section>
  );
}
