import { getCollection } from 'astro:content';
import config from '../site.config';
import type { RouteInfo } from './types';

const visible = ({ data }: { data: { draft: boolean } }) => import.meta.env.DEV || !data.draft;

/** Projects in the work table's order. */
export async function projects() {
  return (await getCollection('projects', visible)).sort((a, b) => a.data.order - b.data.order || a.data.title.localeCompare(b.data.title));
}

/** Posts, newest first. */
export async function posts() {
  return (await getCollection('writing', visible)).sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export const fmtDate = (d: Date) => d.toISOString().slice(0, 10);

/** Every page, numbered as sheets of one drawing. Posts share one entry each under /writing/. */
export async function routes(): Promise<{ routes: Record<string, RouteInfo>; sheets: number }> {
  const r: Record<string, RouteInfo> = {};
  let n = 0;
  const add = (path: string, t: string, label: string, tag: string) => {
    r[path] = { n: ++n, t, label, tag, transition: config.transitions[path] };
  };
  add('/', 'map', 'Map', '/');
  add('/work', 'work', 'Work', '/work');
  for (const p of await projects()) {
    const path = `/work/${p.id}`;
    add(path, p.id, p.data.title, p.data.tag);
    r[path].transition = p.data.transition ?? { scene: 'type', lines: [['cmd', `cat work/${p.id}/README.md`]] };
  }
  add('/writing', 'writing', 'Writing', '/writing');
  for (const p of await posts()) {
    add(`/writing/${p.id}`, 'post', p.data.title, p.data.kind);
    r[`/writing/${p.id}`].transition = { scene: 'type', lines: [['cmd', `less writing/${p.id}.md`]] };
  }
  add('/about', 'about', 'About', '/about');
  return { routes: r, sheets: n };
}
