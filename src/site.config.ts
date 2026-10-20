// Everything about you that is not a project or a post lives here.
// Projects: src/content/projects/*.md. Posts: src/content/writing/*.md.
// The demo person below, Richard Hendricks, is fictional; .example domains are reserved and reach no one.

import type { SiteConfig } from './lib/types';

const config: SiteConfig = {
  name: 'Richard Hendricks',
  /** Shown in the header, the map's first box and the title block. */
  domain: 'hendricks.example',
  email: 'richard@hendricks.example',
  description: 'Richard Hendricks builds compression and the networks that move what it makes.',

  hero: {
    eyebrow: 'compression and distributed systems',
    lede: 'I make files smaller than anyone thought they could get, and build the networks that move them.',
    /** A status line with a dot. Leave it out if you are not looking. */
    status: 'open to staff engineering roles',
    facts: [
      { strong: '5.2', text: 'Weissman score, measured' },
      { strong: '2', text: 'companies founded' },
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
      note: 'middle-out feeds pied-piper, which feeds pipernet',
    },
    /** auto, diagram or tree. auto draws the tree when the diagram is too deep to fit. */
    layout: 'auto',
    nodes: [
      { id: 'root', kind: 'edge', href: '/about', tag: 'edge · dns', name: 'hendricks.example', sub: 'Richard Hendricks. Compression and distributed systems.' },
      { id: 'work', kind: 'router', parent: 'root', href: '/work', tag: 'router · /work', name: 'Work', sub: '4 projects, from algorithm to network' },
      { id: 'middle-out', kind: 'model', parent: 'work', href: '/work/middle-out', tag: 'model · open source', name: 'middle-out', sub: 'Lossless compression, from the middle out' },
      { id: 'pied-piper', kind: 'queue', parent: 'middle-out', href: '/work/pied-piper', tag: 'pipeline · live', name: 'pied-piper', sub: 'Compression as a platform' },
      { id: 'pipernet', kind: 'client', parent: 'pied-piper', href: '/work/pipernet', tag: 'client · beta', name: 'pipernet', sub: 'An internet without data centers' },
      { id: 'songcheck', kind: 'service', parent: 'work', href: '/work/songcheck', tag: 'service · retired', name: 'songcheck', sub: 'The first Pied Piper: a copyright check for songs' },
      { id: 'writing', kind: 'store', parent: 'root', href: '/writing', tag: 'store · /writing', name: 'Writing', sub: 'Long reads and short notes' },
      { id: 'about', kind: 'person', parent: 'root', href: '/about', tag: 'person · /about', name: 'About', sub: "Who I am, what I've done, how to reach me" },
    ],
  },

  about: {
    /** A file in public/, or null for a monogram. */
    photo: null,
    headline: "Hi, I'm Richard.",
    paragraphs: [
      "I'm an engineer who wrote a compression algorithm in a Palo Alto incubator, then spent five years learning to run a company around it. I care about things that are lossless: data, and trust.",
      "I'm looking for a staff engineering role where I write code again, on infrastructure that has to be fast.",
    ],
    /** The card that opens when someone hovers the photo, like a tooltip on a component. */
    card: {
      chip: '1 engineer',
      subtitle: 'Compression · networks · infrastructure',
      rows: [
        ['Ships', 'Compression, peer-to-peer networks and the APIs between them'],
        ['Stack', 'C++, Rust, Go, Python'],
        ['Seeking', 'Staff roles where I write code again'],
      ],
      flavor: '"Make it smaller. Then make it smaller again."',
      foot: ['lookup → Richard Hendricks', 'found'],
    },
    links: [
      { label: 'GitHub', handle: 'richardhendricks', href: 'https://github.com/' },
      { label: 'LinkedIn', handle: 'richardhendricks', href: 'https://www.linkedin.com/' },
    ],
    experience: [
      { when: '2014 — 2019', title: 'Founder and CEO · Pied Piper', text: 'Took middle-out from an incubator to a compression platform and a decentralized network.', chips: ['C++', 'Go', 'Rust'] },
      { when: '2012 — 2014', title: 'Software Engineer · Hooli', text: 'Platform team. Left to build Pied Piper.', chips: ['Python', 'C++'] },
    ],
  },

  /** The snippet typed while a section page opens. Projects set their own in their front matter. */
  transitions: {
    '/work': { scene: 'type', lines: [['cmd', 'ls ~/work'], ['out', 'middle-out/  pied-piper/  pipernet/  songcheck/']] },
    '/writing': { scene: 'type', lines: [['code', 'posts = sorted(load("writing/*.md"), key=lambda p: p.date, reverse=True)']] },
    '/about': { scene: 'type', lines: [['cmd', 'whoami'], ['out', 'richard hendricks · compression and distributed systems']] },
  },
};

export default config;
