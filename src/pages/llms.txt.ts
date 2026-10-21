/**
 * /llms.txt — a plain Markdown summary of the whole profile for AI assistants and
 * recruiting agents (https://llmstxt.org). Generated from the same JSON as the
 * pages, so it can never drift out of date.
 */
import type { APIRoute } from 'astro';
import { getEntries } from 'astro:content';
import { formatRange } from '../lib/format';
import { getExperience, getProfile, getProjects, projectKind, projectPeriod, projectUrl, roleRange } from '../lib/content';
import { richTextToPlain } from '../lib/rich-text';

export const GET: APIRoute = async ({ site }) => {
  const [profile, roles, projects] = await Promise.all([getProfile(), getExperience(), getProjects()]);
  const abs = (path: string) => new URL(path, site).href;

  const links = [
    `- Email: ${profile.email}`,
    profile.links.linkedin && `- LinkedIn: ${profile.links.linkedin}`,
    profile.links.github && `- GitHub: ${profile.links.github}`,
    profile.links.cv && `- CV: ${abs(profile.links.cv)}`,
    `- Location: ${profile.location.display}, ${profile.location.countryCode}${profile.citizenship ? ` (${profile.citizenship})` : ''}`,
  ].filter(Boolean);

  const experience = roles.map((role) => {
    const { data } = role;
    const head = `### ${data.role}, ${data.organization} (${roleRange(role)})`;
    const bullets = data.highlights.map((h) => `- ${richTextToPlain(h)}`);
    const skills = data.skills.length ? [`- Skills: ${data.skills.join(', ')}`] : [];
    return [head, ...bullets, ...skills].join('\n');
  });

  const education = profile.education.map((e) =>
    `- ${e.degree}, ${e.institution} (${formatRange(e.start, e.end, { ongoing: !e.end, ongoingLabel: 'present' })})` +
    (e.grade ? `, ${e.gradeLabel ?? 'grade'} ${e.grade}/10` : '') +
    (e.honours.length ? `, ${e.honours.join(', ')}` : ''),
  );

  const projectLines = await Promise.all(
    projects.map(async (p) => {
      const cats = (await getEntries(p.data.categories)).map((c) => c.data.label).join(', ');
      const period = projectPeriod(p);
      return (
        `- [${p.data.title}](${abs(projectUrl(p))}): ${p.data.summary} ` +
        `(${projectKind(p)}${period ? `, ${period}` : ''}; ${cats}; ${p.data.skills.join(', ')}` +
        (p.data.awards.length ? `; ${p.data.awards.join(', ')}` : '') +
        ')'
      );
    }),
  );

  const body = [
    `# ${profile.name}`,
    '',
    `> ${profile.headline} ${richTextToPlain(profile.summary)}`,
    '',
    '## Contact',
    ...links,
    '',
    '## Experience',
    experience.join('\n\n'),
    '',
    '## Education',
    ...education,
    '',
    '## Competencies',
    ...profile.competencies.map((c) => `- ${c.title}: ${c.skills.join(', ')}`),
    '',
    '## Languages',
    ...profile.languages.map((l) => `- ${l.name}: ${l.label ?? l.level}${l.note ? ` (${l.note})` : ''}`),
    '',
    '## Projects',
    ...projectLines,
    '',
  ].join('\n');

  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
