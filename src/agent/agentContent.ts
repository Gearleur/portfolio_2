import { profile } from '../data/profile';
import { professionalExperiences } from '../data/professionalExperience';
import { machineProfile, machineProjects, machineSkillGroups } from '../components/machine/machineResumeData';
import { getMachineResumeMarkdown } from '../components/machine/machineResumeMarkdown';

export const agentPrompt = `Use the following profile as context about Alexandre Teixeira, an AI engineer who builds AI products from business needs through deployment and adoption.

Answer my question using the supplied experience, projects and skills. Cite the relevant role or project when discussing a result. Distinguish facts stated in the CV from your own interpretation, and say when information is missing. Dates, metrics and ongoing work reflect the source CV; do not infer current availability or an updated employment status.

If I have not asked a specific question, give me a short introduction to Alexandre's background and ask what I would like to explore. Respond in the language of our conversation.`;

export function getAgentProfile() {
  return {
    name: profile.name,
    role: machineProfile.role,
    summary: machineProfile.summary,
    contact: {
      email: profile.email,
      phone: profile.phoneDisplay,
      location: profile.location,
      linkedin: profile.linkedinUrl,
      github: profile.githubUrl,
    },
    provenance: {
      kind: 'Self-authored professional profile based on the supplied CVs',
      sources: ['/CV_en.pdf', '/CV_fr.pdf'],
      dateNote: 'Periods and present-tense claims reflect the source CV, not a live employment feed.',
    },
    education: machineProfile.education.map(({ school, period, degree, courses }) => ({ school, period, degree, courses: [...courses] })),
    experience: professionalExperiences.map(({ company, role, period, summary, highlights, technologies }) => ({
      company, role, period, summary, highlights: [...highlights], technologies: [...technologies],
    })),
    projects: machineProjects.map(({ id, period, title, affiliation, summary, highlights, stack, system }) => ({
      id, period, title, affiliation, summary, highlights: [...highlights], stack: [...stack],
      system: system.map(({ component, implementation }) => ({ component, implementation })),
    })),
    skills: machineSkillGroups.map(({ label, values }) => ({ label, values: [...values] })),
    languages: machineProfile.languages,
    leadership: machineProfile.leadership.map(({ role, period, summary }) => ({ role, period, summary })),
  };
}

export function getAgentMarkdown() {
  return `${getMachineResumeMarkdown().trim()}

## SOURCES

This is Alexandre Teixeira's self-authored professional profile, based on the supplied CVs.
Dates, metrics and present-tense statements reflect these sources, not live employment updates.

- [CV in English](/CV_en.pdf)
- [CV en français](/CV_fr.pdf)
- [Structured profile](/agent/profile.json)
- [Human portfolio](/)
`;
}

export function getAgentContext() {
  return `${agentPrompt}\n\n--- BEGIN PROFILE ---\n\n${getAgentMarkdown()}\n--- END PROFILE ---\n`;
}
