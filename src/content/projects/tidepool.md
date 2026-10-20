---
title: tidepool
summary: Streaming ingestion that writes every event exactly once, from Kafka to Postgres, at up to 40,000 events a second.
blurb: Streaming ingestion with exactly-once writes
tag: stream · open source
year: "2025"
stack: Go, Kafka, Postgres
order: 1
facts:
  - [Role, "Design and build, with one other engineer"]
  - [Stack, "Go, Kafka, Postgres, Kubernetes"]
  - [Status, "In production since March 2025"]
links:
  - { label: GitHub, href: "https://github.com/" }
transition:
  scene: pipeline
  stages:
    - { name: ingest, note: "Kafka, 24 partitions" }
    - { name: validate, note: "schemas checked at the edge" }
    - { name: enrich, note: "joined against 3 lookups" }
    - { name: commit, note: "exactly once into Postgres" }
  result: committed at offset 18,442,091
---

## The problem

Three teams each wrote their own consumer, and each lost or doubled a few events a day. Nobody could say how many.

## How it works

<ol class="steps">
  <li><span class="n">01</span><b>Ingest</b><span>One consumer group reads every topic.</span></li>
  <li><span class="n">02</span><b>Validate</b><span>Events that fail their schema go to a dead-letter topic with the reason.</span></li>
  <li><span class="n">03</span><b>Enrich</b><span>Joins against three lookup tables, cached per partition.</span></li>
  <li><span class="n">04</span><b>Commit</b><span>Rows and the consumer offset commit in one transaction.</span></li>
</ol>

## Measured

<div class="big">
  <div><b>40k</b><span>events a second at peak, on 6 pods</span></div>
  <div><b>0</b><span>lost or doubled events in a 30-day audit</span></div>
  <div><b>180 ms</b><span>from produce to queryable, at the 99th percentile</span></div>
</div>

## What I'd do next

Move the lookups into the stream itself, so a slow table can't stall a partition.

*Demo project from schema-folio. Replace this file with your own.*
