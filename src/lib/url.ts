// The site can live at the root of a domain or under a folder (GitHub Pages: you.github.io/repo/).
// Write every internal link as a root path ('/work') and pass it through url().

/** The folder the site is served from, without a trailing slash: '' at a domain's root. */
export const base = import.meta.env.BASE_URL.replace(/\/$/, '');

/** A root path ('/work') as a link that works wherever the site is served. Other links pass through. */
export const url = (path: string) => (path.startsWith('/') && !path.startsWith('//') ? `${base}${path}` || '/' : path);
