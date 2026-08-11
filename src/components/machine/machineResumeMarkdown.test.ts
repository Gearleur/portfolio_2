import { describe, expect, it } from 'vitest';
import { professionalExperiences } from '../../data/professionalExperience';
import { getMachineResumeMarkdown } from './machineResumeMarkdown';

describe('machine resume Markdown', () => {
  it('contains the expected identity and professional experience data', () => {
    const markdown = getMachineResumeMarkdown();

    expect(markdown).toContain('# ALEXANDRE TEIXEIRA');
    expect(markdown).toContain('alexandretei13@gmail.com');
    expect(markdown).toContain(professionalExperiences[0].company);
    expect(markdown).toContain(professionalExperiences[0].summary);
  });
});
