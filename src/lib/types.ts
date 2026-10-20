// Types for site.config.ts and for what the client script receives.

export type Kind = 'edge' | 'router' | 'service' | 'model' | 'client' | 'store' | 'queue' | 'person';
export type ScriptLine = ['cmd' | 'code' | 'out', string];

/**
 * What plays in the box that opens on the way to a page.
 * - `type`: lines typed as in a terminal.
 * - `pipeline`: a request flowing through named stages.
 * - any other name: a scene you add in src/scripts/scenes/ (see the README).
 */
export type Transition =
  | { scene: 'type'; lines: ScriptLine[] }
  | { scene: 'pipeline'; stages: { name: string; note?: string }[]; result?: string }
  | { scene: string; [param: string]: unknown };

export interface MapNode {
  id: string;
  kind: Kind;
  /** The node this one is fed by; the arrow points from it. Leave out for the first box. */
  parent?: string;
  href: string;
  tag: string;
  name: string;
  sub: string;
  /** Not built yet: dashed outline and arrow. */
  planned?: boolean;
}

export interface SiteConfig {
  name: string;
  domain: string;
  email: string;
  description: string;
  hero: {
    eyebrow: string;
    lede: string;
    status?: string;
    facts: { strong: string; text: string }[];
  };
  map: {
    caption: { spec: string; runtime: string; note?: string };
    nodes: MapNode[];
  };
  about: {
    photo: string | null;
    headline: string;
    paragraphs: string[];
    card: {
      chip: string;
      subtitle: string;
      rows: [string, string][];
      flavor?: string;
      foot: [string, string];
    };
    links: { label: string; handle: string; href?: string }[];
    experience: { when: string; title: string; text: string; chips?: string[] }[];
  };
  transitions: Record<string, Transition>;
}

/** One page, as the title block, the status bar and the transitions see it. */
export interface RouteInfo {
  n: number;
  t: string;
  label: string;
  tag: string;
  transition?: Transition;
}
