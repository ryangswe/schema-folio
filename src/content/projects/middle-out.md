---
title: middle-out
summary: A lossless compression algorithm that works from the middle of the data outward. Everything else on this map is built on it.
blurb: Lossless compression, from the middle out
tag: model · open source
year: "2014"
stack: C++, Python
order: 1
facts:
  - [Role, "Author"]
  - [Stack, "C++, with a Python reference version"]
  - [Score, "Weissman 5.2 on the standard test set"]
links:
  - { label: GitHub, href: "https://github.com/" }
transition:
  scene: pipeline
  stages:
    - { name: chunk, note: "split at the median, not the edges" }
    - { name: predict, note: "a learned model of the next block" }
    - { name: encode, note: "outward, in both directions" }
    - { name: verify, note: "bit for bit against the input" }
  result: lossless · Weissman 5.2
---

## The problem

Every compressor I tried hit the same wall on video: past the easy gains, each extra percent cost more time than it saved.

## How it works

<ol class="steps">
  <li><span class="n">01</span><b>Chunk</b><span>Split each block at its median, so both halves start from the most predictable point.</span></li>
  <li><span class="n">02</span><b>Predict</b><span>A small learned model guesses the next symbol in each direction.</span></li>
  <li><span class="n">03</span><b>Encode</b><span>Only the difference from the guess is written, working outward.</span></li>
  <li><span class="n">04</span><b>Verify</b><span>Every output is decoded and compared with its input before it is kept.</span></li>
</ol>

## Measured

<div class="big">
  <div><b>5.2</b><span>Weissman score on the standard test set</span></div>
  <div><b>0</b><span>bits lost: every output decodes to its input exactly</span></div>
  <div><b>2.9×</b><span>faster to decode than the previous best at the same ratio</span></div>
</div>

## What I'd do next

Make the predictor smaller, so phones can run it without a fan they don't have.

*Demo project from schema-folio. Replace this file with your own.*
