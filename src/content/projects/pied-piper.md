---
title: pied-piper
summary: Compression as a platform. Upload anything, and it is stored and served at a fraction of its size, built on middle-out.
blurb: Compression as a platform
tag: pipeline · live
year: "2015"
stack: Go, C++, Kubernetes
order: 2
facts:
  - [Role, "Founder, wrote the first version"]
  - [Stack, "Go services around the C++ core, on Kubernetes"]
  - [Status, "In production since 2015"]
transition:
  scene: pipeline
  stages:
    - { name: upload, note: "resumable, any size" }
    - { name: compress, note: "middle-out, on 40 workers" }
    - { name: shard, note: "3 copies, 3 regions" }
    - { name: serve, note: "decoded at the edge" }
  result: stored at 1/11 the size
---

## The problem

People wanted middle-out, not a library they had to build around. They wanted to upload a file and get it back smaller.

## How it works

<ol class="steps">
  <li><span class="n">01</span><b>Upload</b><span>Resumable uploads, so a dropped connection costs a chunk, not the file.</span></li>
  <li><span class="n">02</span><b>Compress</b><span>Chunks are compressed in parallel and verified before they are acknowledged.</span></li>
  <li><span class="n">03</span><b>Shard</b><span>Three copies in three regions.</span></li>
  <li><span class="n">04</span><b>Serve</b><span>Files are decoded at the edge, close to whoever asked.</span></li>
</ol>

## Measured

<div class="big">
  <div><b>11×</b><span>median size reduction on uploaded video</span></div>
  <div><b>99.95%</b><span>of requests served in under 200 ms, over 12 months</span></div>
</div>

*Demo project from schema-folio. Replace this file with your own.*
