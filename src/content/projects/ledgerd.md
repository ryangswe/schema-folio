---
title: ledgerd
summary: An event-sourced ledger service. Every balance is a fold over its events, so any balance can be explained line by line.
blurb: An event-sourced ledger
tag: service · in production
year: "2024"
stack: Go, Postgres, gRPC
order: 4
facts:
  - [Role, "Tech lead, team of 3"]
  - [Stack, "Go, Postgres, gRPC"]
transition:
  scene: type
  lines:
    - [cmd, "curl -s ledgerd/v1/accounts/acct_42/balance"]
    - [out, '{ "balance": "1204.18", "version": 9312 }']
---

## The idea

Store what happened, not the result. A balance is computed from its events, and an audit is a replay.

## Measured

<div class="big">
  <div><b>99.99%</b><span>availability over the last 12 months</span></div>
  <div><b>4 ms</b><span>to read a balance, at the 99th percentile</span></div>
</div>

*Demo project from schema-folio. Replace this file with your own.*
