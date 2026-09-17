import { professionalExperiences } from '../../data/professionalExperience';
import { profile } from '../../data/profile';
import { machineProfile, machineProjects, machineSkillGroups } from './machineResumeData';

function renderList(items: string[]) {
  return items.map((item) => `- ${item}`).join('\n');
}

function renderExperience(index: number) {
  const experience = professionalExperiences[index];

  return `### [${index}] ${experience.role}, ${experience.company}
**Period:** ${experience.period}

${experience.summary}

${renderList(experience.highlights)}

**Stack:** [${experience.technologies.map((technology) => `"${technology}"`).join(', ')}]`;
}

function renderProject(index: number) {
  const project = machineProjects[index];
  const affiliation = project.affiliation ? `**Affiliation:** ${project.affiliation}\n` : '';
  const tableRows = project.system
    .map((row) => `| ${row.component} | ${row.implementation} |`)
    .join('\n');

  return `### [${String(index).padStart(2, '0')}] ${project.title}
**Period:** ${project.period}
${affiliation}
${project.summary}

${renderList(project.highlights)}

| Component | Implementation |
| --- | --- |
${tableRows}

**Stack:** [${project.stack.map((technology) => `"${technology}"`).join(', ')}]`;
}

function renderSkillsTable() {
  return machineSkillGroups
    .map((group) => `| ${group.label} | ${group.values.join(' · ')} |`)
    .join('\n');
}

export function getMachineResumeMarkdown() {
  return `# ${profile.name.toUpperCase()}
${machineProfile.role}

\`\`\`json
{
  "email": "${profile.email}",
  "phone": "${profile.phoneDisplay}",
  "location": "${profile.location}",
  "linkedin": "${profile.linkedinUrl}",
  "github": "${profile.githubUrl}",
  "source": ["CV_en.pdf", "CV_fr.pdf"]
}
\`\`\`

> ${machineProfile.summary}

## EDUCATION

${machineProfile.education.map((education) => `### ${education.school}
**${education.period}**

${education.degree}

${renderList(education.courses)}`).join('\n\n')}

## PROFESSIONAL_EXPERIENCE[]

${professionalExperiences.map((_, index) => renderExperience(index)).join('\n\n')}

## SELECTED_PROJECTS[]

${machineProjects.map((_, index) => renderProject(index)).join('\n\n')}

## TECHNICAL_SKILLS

| Namespace | Capabilities[] |
| --- | --- |
${renderSkillsTable()}

## LANGUAGES_AND_LEADERSHIP

- **Languages:** ${machineProfile.languages}
${machineProfile.leadership.map((entry) => `- **${entry.role} (${entry.period}):** ${entry.summary}`).join('\n')}
`;
}
