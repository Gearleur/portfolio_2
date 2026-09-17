import { expect, it } from 'vitest';
import { getAgentProfile } from './agentContent';
import { professionalExperiences } from '../data/professionalExperience';
import { machineProjects } from '../components/machine/machineResumeData';

it('only publishes explicitly selected fields even if source records gain private metadata', () => {
  const experience = professionalExperiences[0];
  const project = machineProjects[0];
  Object.assign(experience, { internalNote: 'unpublished-experience-note' });
  Object.assign(project, { internalNote: 'unpublished-project-note' });
  try {
    const serialized = JSON.stringify(getAgentProfile());
    expect(serialized).toContain('SNCF GPT');
    expect(serialized).not.toContain('internalNote');
    expect(serialized).not.toContain('unpublished-');
    expect(serialized).not.toContain('imageSrc');
  } finally {
    Reflect.deleteProperty(experience, 'internalNote');
    Reflect.deleteProperty(project, 'internalNote');
  }
});
