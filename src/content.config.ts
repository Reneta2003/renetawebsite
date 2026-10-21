/**
 * Content model for the whole site.
 *
 * Every piece of frequently edited content lives in `src/content/` as JSON and is
 * validated here at build time: a typo in a category id, a missing image or a
 * malformed date fails `npm run build` with a message pointing at the file.
 * The schema is documented for editors in README.md ("Managing content").
 */
import { defineCollection, reference } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';

/** "2024", "2024-11". Months make the period precise; a year alone is fine for older work. */
const partialDate = z
  .string()
  .regex(/^\d{4}(-(0[1-9]|1[0-2]))?$/, 'Use "YYYY" or "YYYY-MM"');

/**
 * Text that may mark recruiter keywords with **double asterisks**.
 * They render as highlighted <strong> elements; everything else is plain text.
 */
const richText = z.string().min(1);

const link = z.object({
  label: z.string().min(1),
  url: z.url(),
});

const categories = defineCollection({
  loader: file('src/content/categories.json'),
  schema: z.object({
    label: z.string().min(1),
    /** Shown in Schema.org `about`; describes the discipline in plain words. */
    description: z.string().min(1),
    /** Position of the filter button. */
    order: z.number().int(),
  }),
});

const projects = defineCollection({
  // One JSON file per project. The file name becomes the URL: projects/<file-name>/
  loader: glob({ pattern: '*.json', base: './src/content/projects' }),
  schema: ({ image }) =>
    z.object({
      title: z.string().min(1),
      /** One line, shown in the project list. */
      summary: z.string().min(1).max(140),
      /** Full description: shown when a row is opened and on the project page. Paragraphs separated by blank lines. */
      description: z.string().min(1),
      /** What kind of work it was, e.g. "MSc thesis", "Personal project", "Course project". */
      context: z.string().min(1),
      collaboration: z.enum(['individual', 'team']),
      /** Client or host organisation, if any ("Topicus", "Cofano"). */
      client: z.string().optional(),
      institution: z.string().optional(),
      /** Omit entirely if the dates are unknown. */
      period: z
        .object({
          start: partialDate,
          /** Omit when the work fits in one period ("2022") or is ongoing. */
          end: partialDate.optional(),
          /** Still running: shows as "<start> – now". */
          ongoing: z.boolean().default(false),
          /** Set when the dates are estimated (e.g. from the quarter a course ran in). */
          approximate: z.boolean().default(false),
        })
        .optional(),
      categories: z.array(reference('categories')).min(1),
      skills: z.array(z.string().min(1)).min(1),
      awards: z.array(z.string().min(1)).default([]),
      image: z
        .object({
          src: image(),
          alt: z.string().min(1),
        })
        .optional(),
      links: z.array(link).default([]),
      /** Lower numbers come first. Projects without `order` follow, newest first. */
      order: z.number().int().optional(),
      /** Open this row in the list on page load. */
      expanded: z.boolean().default(false),
      /** Notes for yourself (missing photos, results to add). Never rendered. */
      todo: z.string().optional(),
    }),
});

const experience = defineCollection({
  loader: file('src/content/experience.json'),
  schema: z.object({
    organization: z.string().min(1),
    organizationUrl: z.url().optional(),
    organizationType: z.enum(['Organization', 'CollegeOrUniversity']).default('Organization'),
    role: z.string().min(1),
    start: partialDate,
    /** Omit for your current role. */
    end: partialDate.optional(),
    location: z.string().min(1).optional(),
    employmentType: z.string().min(1).optional(),
    highlights: z.array(richText).default([]),
    skills: z.array(z.string().min(1)).default([]),
    order: z.number().int(),
    todo: z.string().optional(),
  }),
});

const cefr = z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'native']);

const profile = defineCollection({
  loader: file('src/content/profile.json'),
  schema: ({ image }) =>
    z.object({
      name: z.string().min(1),
      givenName: z.string().min(1),
      familyName: z.string().min(1),
      jobTitle: z.string().min(1),
      headline: z.string().min(1),
      summary: richText,
      email: z.email(),
      location: z.object({
        locality: z.string(),
        countryCode: z.string().length(2),
        display: z.string(),
      }),
      citizenship: z.string().optional(),
      /** Leave a value out (or null) to hide that link everywhere. */
      links: z.object({
        cv: z.string().nullish(),
        linkedin: z.url().nullish(),
        github: z.url().nullish(),
      }),
      photo: z.object({
        desktop: image(),
        mobile: image(),
        alt: z.string().min(1),
      }),
      competencies: z
        .array(
          z.object({
            title: z.string().min(1),
            category: reference('categories'),
            skills: z.array(z.string().min(1)).min(1),
          }),
        )
        .min(1),
      education: z.array(
        z.object({
          degree: z.string().min(1),
          institution: z.string().min(1),
          institutionUrl: z.url().optional(),
          start: partialDate,
          end: partialDate.optional(),
          grade: z.string().optional(),
          gradeLabel: z.string().optional(),
          honours: z.array(z.string()).default([]),
        }),
      ),
      languages: z.array(
        z.object({
          name: z.string().min(1),
          /** CEFR level; "native" fills the whole scale. */
          level: cefr,
          /** Overrides the visible level label, e.g. "Fluent". */
          label: z.string().optional(),
          note: z.string().optional(),
          /** BCP-47 code, used in structured data. */
          code: z.string().min(2),
        }),
      ),
      outsideWork: z.string().min(1),
      sections: z.object({
        competencies: z.object({ title: z.string(), intro: z.string() }),
        experience: z.object({ title: z.string(), intro: z.string() }),
        projects: z.object({ title: z.string(), intro: z.string() }),
        footerPrompt: z.string(),
      }),
      seo: z.object({
        title: z.string().min(1),
        description: z.string().min(50).max(170),
      }),
    }),
});

export const collections = { categories, projects, experience, profile };
