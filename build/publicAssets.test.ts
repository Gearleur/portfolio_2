import { describe, expect, it } from 'vitest';
import { publicationRisk } from './publicAssets';

describe('public publication guard', () => {
  it.each(['.env', 'backup/.env.production', '.git/config', 'keys/id_rsa', 'server.key', 'bundle.js.map', 'backup.sqlite', 'src/private.ts'])('rejects accidental private file %s', (path) => {
    expect(publicationRisk(path)).not.toBeNull();
  });

  it('detects credentials inside otherwise publishable text', () => {
    expect(publicationRisk('notes.txt', '-----BEGIN PRIVATE KEY-----')).not.toBeNull();
    expect(publicationRisk('settings.json', `{"token":"ghp_${'x'.repeat(36)}"}`)).not.toBeNull();
  });

  it.each(['CV_fr.pdf', 'CV_en.pdf', 'assets/profesional_experience/esncf.jpg', 'fonts/DepartureMono-Regular.woff2', 'sw.js'])('allows intended public asset %s', (path) => {
    expect(publicationRisk(path)).toBeNull();
  });
});
