---
title: pipernet
summary: An internet without data centers. Files are compressed with middle-out and spread across the phones that run the app.
blurb: An internet without data centers
tag: client · beta
year: "2018"
stack: Rust, Swift, Kotlin
order: 3
facts:
  - [Role, "Lead engineer"]
  - [Stack, "A Rust core, with Swift and Kotlin apps"]
  - [Users, "In closed beta"]
transition:
  scene: type
  lines:
    - [cmd, "pipernet get keynote.mp4"]
    - [out, "fetched 1.2 GB from 14 peers, 0 servers  (3.1 s)"]
---

## What it is

Every phone that runs pipernet stores a few compressed shards of other people's files and serves them nearby. Nobody owns the network, so nobody can switch it off.

## What I learned

The hard part was not the network. It was making a phone that serves files still feel like a phone: no battery drain, no heat, no surprise data bill.

*Demo project from schema-folio. Replace this file with your own.*
