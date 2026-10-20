---
title: Drawing your site as a system
description: How this site's map works, and how to draw your own work as components and arrows.
date: 2026-10-20
kind: long read
---

Most portfolios are a list. This one is a diagram: your work drawn as the system it really is, with every box a page you can open.

## Start from what feeds what

Before you write any config, sketch your work on paper. Which project produces data another one uses? Which one is a service, which one a model, which one something people install? The arrows matter more than the boxes. A site whose diagram is true says more than one whose diagram is decorative.

## Pick a shape for each box

The shape says what kind of thing it is, the way an architecture diagram would:

- **edge**: your domain, where requests come in
- **router**: a section that fans out, like /work
- **service**, **model**, **queue**: things you built that run
- **client**: something people install or open
- **store**: where your writing lives
- **person**: you

## Write it down

The map lives in `src/site.config.ts`. Each node names its parent, and the layout follows: a node's column is its depth, and a parent sits level with its children. Projects are Markdown files in `src/content/projects/`, and each can name the scene that plays on the way in: a typed snippet, or a request flowing through stages.

## Keep it honest

Every number on a project page should come from a measurement you can name. Say what you compared against and for how long. A wide interval stated plainly reads better than a precise number nobody believes.

*Demo post from schema-folio. Replace it with your own.*
