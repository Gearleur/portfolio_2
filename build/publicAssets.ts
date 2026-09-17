import { lstatSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Plugin } from 'vite';

export function publicationRisk(path: string, text = ''): string | null {
  if (/(^|\/)(\.env(?:\..*)?|\.git|\.ssh|\.aws|id_(rsa|ed25519)|package(?:-lock)?\.json|pnpm-lock\.yaml)(\/|$)/i.test(path) ||
      /\.(pem|key|p12|pfx|map|ts|tsx|bak|sqlite|db)$/i.test(path)) {
    return 'Private, source or backup file in public assets';
  }
  if (/-----BEGIN (?:RSA |EC |OPENSSH |ENCRYPTED )?PRIVATE KEY-----/.test(text) ||
      /\b(?:ghp_[A-Za-z0-9]{36}|github_pat_[A-Za-z0-9_]{50,}|AKIA[A-Z0-9]{16}|sk_live_[A-Za-z0-9]{20,})\b/.test(text)) {
    return 'Credential signature in a public asset';
  }
  return null;
}

/** Public is copied verbatim by Vite; reject obvious accidental private uploads. */
export function publicAssetsGuard(): Plugin {
  let publicDir: string | false = false;
  return {
    name: 'public-assets-guard',
    apply: 'build',
    configResolved(config) { publicDir = config.publicDir; },
    buildStart() {
      if (!publicDir) return;
      const visit = (directory: string, prefix = '') => {
        for (const name of readdirSync(directory)) {
          const relative = `${prefix}${name}`;
          const file = join(directory, name);
          const stat = lstatSync(file);
          if (stat.isSymbolicLink()) this.error(`Refusing public symlink: ${relative}`);
          const pathRisk = publicationRisk(relative);
          if (pathRisk) this.error(`${pathRisk}: ${relative}`);
          if (stat.isDirectory()) { visit(file, `${relative}/`); continue; }
          if (/\.(txt|json|html|js|css|md|csv|ya?ml|toml|xml|svg)$/i.test(name)) {
            const contentRisk = publicationRisk(relative, readFileSync(file, 'utf8'));
            if (contentRisk) this.error(`${contentRisk}: ${relative}`);
          }
        }
      };
      visit(publicDir);
    },
  };
}
