// Everything about you that is not a project or a post lives here.
// Projects: src/content/projects/*.md. Posts: src/content/writing/*.md.
// The demo person below, Morgan Vale, is fictional; .example domains are reserved and reach no one.

import type { SiteConfig } from './lib/types';

const config: SiteConfig = {
  name: 'Morgan Vale',
  /** Shown in the header, the map's first box and the title block. */
  domain: 'morganvale.example',
  email: 'morgan@morganvale.example',
  description: 'Morgan Vale builds data pipelines and the services that serve them.',

  hero: {
    eyebrow: 'backend and data engineer',
    lede: 'I build pipelines that move a lot of data reliably, and the services and models that put it to use.',
    /** A status line with a dot. Leave it out if you are not looking. */
    status: 'open to staff engineering roles',
    facts: [
      { strong: '3', text: 'systems in production' },
      { strong: '40k', text: 'events a second, at peak' },
    ],
  },

  /**
   * The map: your site drawn as a system. Each node is a box that links to a page; `parent` draws the
   * arrow into it. The layout is automatic: a node's column is its depth, and a parent sits level with
   * its children. Kinds set the shape: edge, router, service, model, client, store, queue, person.
   */
  map: {
    caption: {
      spec: 'fig. 1: this site, drawn as a system. Each box is a page.',
      runtime: 'live: each node is a route. Click one to send a request through it.',
      note: 'tidepool feeds ranker, which feeds shelf',
    },
    nodes: [
      { id: 'root', kind: 'edge', href: '/about', tag: 'edge · dns', name: 'morganvale.example', sub: 'Morgan Vale. Backend and data engineer.' },
      { id: 'work', kind: 'router', parent: 'root', href: '/work', tag: 'router · /work', name: 'Work', sub: '4 projects, from stream to screen' },
      { id: 'tidepool', kind: 'queue', parent: 'work', href: '/work/tidepool', tag: 'stream · open source', name: 'tidepool', sub: 'Streaming ingestion with exactly-once writes' },
      { id: 'ranker', kind: 'model', parent: 'tidepool', href: '/work/ranker', tag: 'model', name: 'ranker', sub: 'A small learning-to-rank model' },
      { id: 'shelf', kind: 'client', parent: 'ranker', href: '/work/shelf', tag: 'client · beta', name: 'shelf', sub: 'A reading list that sorts itself' },
      { id: 'ledgerd', kind: 'service', parent: 'work', href: '/work/ledgerd', tag: 'service · in production', name: 'ledgerd', sub: 'An event-sourced ledger' },
      { id: 'writing', kind: 'store', parent: 'root', href: '/writing', tag: 'store · /writing', name: 'Writing', sub: 'Long reads and short notes' },
      { id: 'about', kind: 'person', parent: 'root', href: '/about', tag: 'person · /about', name: 'About', sub: "Who I am, what I've done, how to reach me" },
    ],
  },

  about: {
    /** A file in public/, or null for a monogram. */
    photo: null,
    headline: "Hi, I'm Morgan.",
    paragraphs: [
      "I'm a backend engineer who ended up owning data pipelines, and liked it. I care about systems that keep working at 3 a.m. and numbers you can trust.",
      "I'm looking for a staff engineering role on a data platform team.",
    ],
    /** The card that opens when someone hovers the photo, like a tooltip on a component. */
    card: {
      chip: '1 engineer',
      subtitle: 'Backend · data · infrastructure',
      rows: [
        ['Ships', 'Pipelines, services and the dashboards that watch them'],
        ['Stack', 'Go, Python, Kafka, Postgres, Kubernetes'],
        ['Seeking', 'Staff roles on data platform teams'],
      ],
      flavor: '"If it isn\'t measured, it isn\'t done."',
      foot: ['lookup → Morgan Vale', 'found'],
    },
    links: [
      { label: 'GitHub', handle: 'morganvale', href: 'https://github.com/' },
      { label: 'LinkedIn', handle: 'morganvale', href: 'https://www.linkedin.com/' },
    ],
    experience: [
      { when: '2023 — now', title: 'Senior Engineer · Example Corp', text: 'Data platform: streaming ingestion and the ledger service.', chips: ['Go', 'Kafka', 'Postgres'] },
      { when: '2019 — 2023', title: 'Software Engineer · Sample Labs', text: 'Search backend and ranking.', chips: ['Python', 'Elasticsearch'] },
    ],
  },

  /** The snippet typed while a section page opens. Projects set their own in their front matter. */
  transitions: {
    '/work': { scene: 'type', lines: [['cmd', 'ls ~/work'], ['out', 'tidepool/  ranker/  shelf/  ledgerd/']] },
    '/writing': { scene: 'type', lines: [['code', 'posts = sorted(load("writing/*.md"), key=lambda p: p.date, reverse=True)']] },
    '/about': { scene: 'type', lines: [['cmd', 'whoami'], ['out', 'morgan vale · backend and data engineer']] },
  },
};

export default config;
