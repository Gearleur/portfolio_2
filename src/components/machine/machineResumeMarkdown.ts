import { professionalExperiences } from '../../data/professionalExperience';
import { machineProjects, machineSkillGroups } from './machineResumeData';

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
  return `# ALEXANDRE TEIXEIRA
AI Engineer · GenAI & Production LLM Systems

\`\`\`json
{
  "email": "alexandretei13@gmail.com",
  "phone": "+33 7 86 01 55 04",
  "location": "Paris, France",
  "linkedin": "alexandre-teixeira-639636214",
  "github": "Gearleur",
  "portfolio": "current_document",
  "availability": "open"
}
\`\`\`

> 0→1 AI Engineer — I turn complex business problems into AI products that get deployed and adopted. My approach: understand the workflow, simplify the problem, and build from idea to impact.

## EDUCATION

### University of Technology of Compiègne (UTC)
**2022–2026 · Compiègne**

Master’s-level Engineering Degree (Diplôme d’Ingénieur), Computer Science

- Artificial Intelligence, optimization, operations research, logic and search-based problem solving, cybersecurity.

### Shanghai University — UTSEUS
**Sep. 2024–Jan. 2025 · Shanghai**

Exchange Program in Artificial Intelligence

- Natural Language Processing, Generative AI, Data Analysis, Data Visualization.

## PROFESSIONAL_EXPERIENCE[]

${professionalExperiences.map((_, index) => renderExperience(index)).join('\n\n')}

## SELECTED_PROJECTS[]

${machineProjects.map((_, index) => renderProject(index)).join('\n\n')}

## TECHNICAL_SKILLS

| Namespace | Capabilities[] |
| --- | --- |
${renderSkillsTable()}

## LANGUAGES_AND_LEADERSHIP

- **Languages:** French (native) · English (professional) · Chinese (basic)
- **Partnership Manager, Imaginarium Festival (2022–2023):** managed sponsorships for a €600,000-budget student festival.
- **Founder Breakfast, Shanghai (2024–2025):** engaged with startup founders on AI-driven innovation.
`;
}
