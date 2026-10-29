/**
 * Read-side of the content model: every page gets its data from here, already
 * sorted and resolved, so components never repeat ordering or lookup logic.
 */
import { getCollection, getEntry, type CollectionEntry } from 'astro:content';
import { dotJoin, formatRange } from './format';

export type Project = CollectionEntry<'projects'>;
export type Role = CollectionEntry<'experience'>;
export type Category = CollectionEntry<'categories'>;

export async function getProfile() {
  const entry = await getEntry('profile', 'reneta');
  if (!entry) throw new Error('src/content/profile.json must contain a "reneta" entry.');
  return entry.data;
}

export async function getCategories(): Promise<Category[]> {
  const categories = await getCollection('categories');
  return categories.sort((a, b) => a.data.order - b.data.order);
}

const endKey = (p: Project) =>
  p.data.period?.ongoing ? '9999-99' : p.data.period?.end ?? p.data.period?.start ?? '0000';

/** Projects with the most recent end date come first; ongoing projects lead. */
export async function getProjects(): Promise<Project[]> {
  const projects = await getCollection('projects');
  return projects.sort((a, b) => endKey(b).localeCompare(endKey(a)));
}

export async function getExperience(): Promise<Role[]> {
  const roles = await getCollection('experience');
  return roles.sort((a, b) => a.data.order - b.data.order);
}

export const projectUrl = (project: Project) => `/projects/${project.id}/`;

/** "MSc thesis · individual", "BSc project · team · for Topicus". */
export const projectKind = ({ data }: Project) =>
  dotJoin(data.context, data.collaboration, data.client && `for ${data.client}`);

export function projectPeriod({ data }: Project): string | undefined {
  if (!data.period) return undefined;
  const { start, end, ongoing, approximate } = data.period;
  return formatRange(start, end, { ongoing, yearsOnly: approximate });
}

export const roleRange = ({ data }: Role) =>
  formatRange(data.start, data.end, { ongoing: !data.end, ongoingLabel: 'present' });

/** Unique skills across projects, alphabetical (case-insensitive). */
export const allProjectSkills = (projects: Project[]) =>
  [...new Set(projects.flatMap((p) => p.data.skills))].sort((a, b) =>
    a.localeCompare(b, 'en', { sensitivity: 'base' }),
  );

export const projectsInCategory = (projects: Project[], categoryId: string) =>
  projects.filter((p) => p.data.categories.some((c) => c.id === categoryId));
