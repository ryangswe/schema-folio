---
title: ranker
summary: A small learning-to-rank model that orders a reading list by what you are likely to finish, trained on the events tidepool collects.
blurb: Learning-to-rank for a reading list
tag: model
year: "2025"
stack: Python, LightGBM, ONNX
order: 2
facts:
  - [Role, "Solo"]
  - [Model, "Gradient-boosted trees, 48 features"]
  - [Serving, "ONNX on the API, under 3 ms a request"]
transition:
  scene: pipeline
  stages:
    - { name: features, note: "48, from the event stream" }
    - { name: score, note: "LightGBM, exported to ONNX" }
    - { name: rerank, note: "diversity pass" }
    - { name: serve, note: "under 3 ms" }
  result: 20 items ranked
---

## Why a model

Sorting by date buried the long articles people saved for the weekend. Sorting by length buried everything else.

## Measured

<div class="big">
  <div><b>+18%</b><span>more saved items finished, in a two-week A/B test</span></div>
  <div><b>2.7 ms</b><span>to score 200 items, at the 99th percentile</span></div>
</div>

Measure against the thing it replaced, and say how long the test ran.

*Demo project from schema-folio. Replace this file with your own.*
