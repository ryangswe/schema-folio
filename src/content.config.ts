import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const line = z.tuple([z.enum(['cmd', 'code', 'out']), z.string()]);
const transition = z.union([
  z.object({ scene: z.literal('type'), lines: z.array(line) }),
  z.object({ scene: z.literal('pipeline'), stages: z.array(z.object({ name: z.string(), note: z.string().optional() })), result: z.string().optional() }),
  z.object({ scene: z.string() }).loose(),
]);

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    /** One or two sentences: the page's summary and its link preview. */
    summary: z.string(),
    /** A short line for the work table. */
    blurb: z.string(),
    /** The small label above the title, e.g. "service · in production". */
    tag: z.string(),
    year: z.string(),
    stack: z.string(),
    /** Position in the work table, lowest first. */
    order: z.number().default(100),
    facts: z.array(z.tuple([z.string(), z.string()])).default([]),
    links: z.array(z.object({ label: z.string(), href: z.string() })).default([]),
    transition: transition.optional(),
    draft: z.boolean().default(false),
  }),
});

const writing = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/writing' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    kind: z.enum(['long read', 'note']).default('long read'),
    /** Drafts build in `astro dev` only. */
    draft: z.boolean().default(false),
  }),
});

export const collections = { projects, writing };
