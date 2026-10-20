import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import config from '../site.config';
import { posts } from '../lib/content';
import { url } from '../lib/url';

export async function GET(context: APIContext) {
  const list = (await posts()).filter((p) => !p.data.draft);
  return rss({
    title: `${config.name}: writing`,
    description: config.description,
    site: new URL(url('/'), context.site!).href,
    trailingSlash: false,
    items: list.map((p) => ({ title: p.data.title, description: p.data.description, pubDate: p.data.date, link: url(`/writing/${p.id}`) })),
  });
}
