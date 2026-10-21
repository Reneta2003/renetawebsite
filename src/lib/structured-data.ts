/**
 * Schema.org JSON-LD builders. The Person node is the anchor: every other node
 * refers back to it by @id, so search engines and agents can connect the
 * profile, the roles and each project into one graph.
 */
import type { getProfile, Project, Role, Category } from './content';
import { projectUrl } from './content';
import { richTextToPlain } from './rich-text';

type Profile = Awaited<ReturnType<typeof getProfile>>;
type Json = Record<string, unknown>;

const abs = (site: URL, path: string) => new URL(path, site).href;
export const personId = (site: URL) => abs(site, '/#person');
const websiteId = (site: URL) => abs(site, '/#website');

const organization = (name: string, type = 'Organization', url?: string): Json => ({
  '@type': type,
  name,
  ...(url && { url }),
});

export function personNode(site: URL, profile: Profile, roles: Role[], photoUrl: string): Json {
  const sameAs = [profile.links.linkedin, profile.links.github].filter(Boolean);
  const knowsAbout = [...new Set([
    ...profile.competencies.flatMap((c) => c.skills),
    ...roles.flatMap(({ data }) => data.skills),
  ])];
  const studying = profile.education.filter((e) => !e.end);
  const completed = profile.education.filter((e) => e.end);

  return {
    '@type': 'Person',
    '@id': personId(site),
    name: profile.name,
    givenName: profile.givenName,
    familyName: profile.familyName,
    url: abs(site, '/'),
    image: photoUrl,
    email: `mailto:${profile.email}`,
    jobTitle: profile.jobTitle,
    description: profile.headline,
    address: {
      '@type': 'PostalAddress',
      addressLocality: profile.location.locality,
      addressCountry: profile.location.countryCode,
    },
    // Role pattern: each EmployeeRole wraps the organisation with dates and title.
    worksFor: roles.map(({ data }) => ({
      '@type': 'EmployeeRole',
      roleName: data.role,
      startDate: data.start,
      ...(data.end && { endDate: data.end }),
      ...(data.employmentType && { employmentType: data.employmentType }),
      worksFor: organization(data.organization, data.organizationType, data.organizationUrl),
    })),
    ...(studying.length && {
      affiliation: studying.map((e) => organization(e.institution, 'CollegeOrUniversity', e.institutionUrl)),
    }),
    alumniOf: completed.map((e) => organization(e.institution, 'CollegeOrUniversity', e.institutionUrl)),
    hasCredential: completed.map((e) => ({
      '@type': 'EducationalOccupationalCredential',
      name: e.degree,
      credentialCategory: 'degree',
      recognizedBy: organization(e.institution, 'CollegeOrUniversity', e.institutionUrl),
    })),
    award: profile.education.flatMap((e) => e.honours),
    knowsAbout,
    knowsLanguage: profile.languages.map((l) => ({ '@type': 'Language', name: l.name, alternateName: l.code })),
    ...(sameAs.length && { sameAs }),
  };
}

export function websiteNode(site: URL, profile: Profile): Json {
  return {
    '@type': 'WebSite',
    '@id': websiteId(site),
    url: abs(site, '/'),
    name: profile.name,
    inLanguage: 'en',
    publisher: { '@id': personId(site) },
  };
}

export function homeGraph(site: URL, profile: Profile, roles: Role[], projects: Project[], photoUrl: string): Json {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      personNode(site, profile, roles, photoUrl),
      websiteNode(site, profile),
      {
        '@type': 'ProfilePage',
        '@id': abs(site, '/'),
        url: abs(site, '/'),
        name: profile.seo.title,
        description: profile.seo.description,
        isPartOf: { '@id': websiteId(site) },
        mainEntity: { '@id': personId(site) },
        about: { '@id': personId(site) },
        hasPart: {
          '@type': 'ItemList',
          name: 'Projects',
          numberOfItems: projects.length,
          itemListElement: projects.map((p, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            url: abs(site, projectUrl(p)),
            name: p.data.title,
          })),
        },
      },
    ],
  };
}

export function projectGraph(
  site: URL,
  profile: Profile,
  project: Project,
  categories: Category[],
  imageUrl: string | undefined,
): Json {
  const { data } = project;
  const url = abs(site, projectUrl(project));
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CreativeWork',
        '@id': `${url}#work`,
        url,
        name: data.title,
        headline: data.title,
        abstract: data.summary,
        description: richTextToPlain(data.description),
        genre: data.context,
        creator: { '@id': personId(site), '@type': 'Person', name: profile.name },
        ...(data.period && { dateCreated: data.period.start }),
        keywords: data.skills.join(', '),
        about: categories.map((c) => ({ '@type': 'Thing', name: c.data.label, description: c.data.description })),
        ...(data.awards.length && { award: data.awards }),
        ...(data.institution && { sourceOrganization: organization(data.institution, 'CollegeOrUniversity') }),
        ...(imageUrl && { image: imageUrl }),
        ...(data.links.length && { sameAs: data.links.map((l) => l.url) }),
        isPartOf: { '@id': websiteId(site) },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: profile.name, item: abs(site, '/') },
          { '@type': 'ListItem', position: 2, name: 'Projects', item: abs(site, '/#projects') },
          { '@type': 'ListItem', position: 3, name: data.title, item: url },
        ],
      },
    ],
  };
}
