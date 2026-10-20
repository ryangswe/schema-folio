// The `pipeline` scene: a request flows through named stages, each lighting up in turn.
//   { scene: 'pipeline', stages: [{ name: 'ingest', note: 'Kafka, 12 partitions' }, ...], result: 'ranked list served' }
// Stages run left to right on wide screens and top to bottom on narrow ones.
import { clamp, ease, lerp, run, tokens, type Scene } from './util';

interface Stage { name: string; note?: string }

export const pipeline: Scene = (c) => {
  const p = c.params as { stages?: Stage[]; result?: string };
  const stages = (p.stages ?? []).slice(0, 7);
  if (!stages.length) return Promise.resolve();
  const T = tokens();
  const g = c.ctx, W = c.width, H = c.height;
  c.heading.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 220, easing: 'ease-in', fill: 'forwards' });

  const n = stages.length;
  const across = W >= 640 && W / n >= 120;
  const pad = Math.max(20, Math.min(56, W * 0.05));
  const gap = across ? Math.max(18, Math.min(48, W * 0.03)) : 18;
  let bw: number, bh: number;
  if (across) { bw = Math.min(220, (W - 2 * pad - (n - 1) * gap) / n); bh = 96; }
  else { bw = Math.min(360, W - 2 * pad); bh = Math.min(76, (H - 2 * pad - (n - 1) * gap - 90) / n); }
  const totalW = across ? n * bw + (n - 1) * gap : bw;
  const totalH = across ? bh : n * bh + (n - 1) * gap;
  const x0 = (W - totalW) / 2, y0 = Math.max(pad, (H - totalH) / 2 - 40);
  const boxes = stages.map((_, i) => ({
    x: across ? x0 + i * (bw + gap) : x0,
    y: across ? y0 : y0 + i * (bh + gap),
    w: bw, h: bh,
  }));
  const STEP = 360, START = 260;
  const D = START + n * STEP + 520;

  const wrap = (text: string, max: number) => {
    const words = text.split(' '), out: string[] = [];
    let line = '';
    for (const w of words) {
      const tryLine = line ? `${line} ${w}` : w;
      if (g.measureText(tryLine).width > max && line) { out.push(line); line = w; } else line = tryLine;
    }
    if (line) out.push(line);
    return out.slice(0, 2);
  };
  const center = (b: { x: number; y: number; w: number; h: number }) => ({ x: b.x + b.w / 2, y: b.y + b.h / 2 });

  let shown = -1;
  const frame = (t: number) => {
    g.fillStyle = T.paper; g.fillRect(0, 0, W, H);
    const appear = clamp(t / START);
    const active = Math.min(n - 1, Math.floor((t - START) / STEP));
    // links between stages
    g.save(); g.strokeStyle = T.rule; g.lineWidth = 1.25; g.globalAlpha = appear;
    for (let i = 0; i < n - 1; i++) {
      const a = boxes[i], b = boxes[i + 1];
      g.beginPath();
      if (across) { g.moveTo(a.x + a.w, a.y + a.h / 2); g.lineTo(b.x - 6, b.y + b.h / 2); }
      else { g.moveTo(a.x + a.w / 2, a.y + a.h); g.lineTo(b.x + b.w / 2, b.y - 6); }
      g.stroke();
    }
    g.restore();
    // stages
    boxes.forEach((b, i) => {
      const lit = t >= START + i * STEP;
      g.save(); g.globalAlpha = appear;
      g.fillStyle = T.raised; g.fillRect(b.x, b.y, b.w, b.h);
      g.strokeStyle = lit ? T.ink : T.rule; g.lineWidth = lit ? 1.5 : 1;
      g.strokeRect(b.x + 0.5, b.y + 0.5, b.w - 1, b.h - 1);
      g.fillStyle = T.ink2; g.font = `500 10.5px ${T.mono}`;
      g.fillText(String(i + 1).padStart(2, '0'), b.x + 12, b.y + 20);
      g.fillStyle = T.ink; g.font = `700 ${Math.min(18, bw / 9)}px ${T.display}`;
      g.fillText(stages[i].name, b.x + 12, b.y + 44);
      if (stages[i].note) {
        g.fillStyle = T.ink2; g.font = `400 12px ${T.mono}`;
        wrap(stages[i].note, b.w - 24).forEach((ln, k) => g.fillText(ln, b.x + 12, b.y + 64 + k * 15));
      }
      if (i === active && t < D - 300) {
        // detection-style brackets on the stage in progress
        const o = 6, l = 12, X0 = b.x - o, Y0 = b.y - o, X1 = b.x + b.w + o, Y1 = b.y + b.h + o;
        g.strokeStyle = T.ink; g.lineWidth = 1.5; g.beginPath();
        g.moveTo(X0, Y0 + l); g.lineTo(X0, Y0); g.lineTo(X0 + l, Y0);
        g.moveTo(X1 - l, Y0); g.lineTo(X1, Y0); g.lineTo(X1, Y0 + l);
        g.moveTo(X1, Y1 - l); g.lineTo(X1, Y1); g.lineTo(X1 - l, Y1);
        g.moveTo(X0 + l, Y1); g.lineTo(X0, Y1); g.lineTo(X0, Y1 - l);
        g.stroke();
      }
      g.restore();
    });
    // the packet
    if (t >= START) {
      const k = clamp((t - START) / (n * STEP));
      const pos = k * (n - 1);
      const i = Math.min(n - 2, Math.floor(pos));
      const a = center(boxes[Math.max(0, i)]), b = center(boxes[Math.min(n - 1, i + 1)]);
      const e = n === 1 ? 0 : ease(clamp(pos - i));
      // Above the row of stages when they run across, left of the column when they stack.
      const px = across ? lerp(a.x, b.x, e) : boxes[0].x - 14;
      const py = across ? boxes[0].y - 14 : lerp(a.y, b.y, e);
      g.fillStyle = T.ink; g.fillRect(px - 4.5, py - 4.5, 9, 9);
    }
    // result
    const r = clamp((t - START - n * STEP) / 260);
    if (r > 0 && p.result) {
      const last = boxes[n - 1];
      const ry = across ? last.y + last.h + 56 : last.y + last.h + 46;
      g.save(); g.globalAlpha = r;
      g.font = `500 11px ${T.mono}`;
      const chip = '200 OK', cw = g.measureText(chip).width + 12;
      const rx = x0;
      g.fillStyle = T.ink; g.fillRect(rx, ry - 14, cw, 20);
      g.fillStyle = T.paper; g.fillText(chip, rx + 6, ry);
      g.fillStyle = T.ink; g.font = `700 ${Math.max(18, Math.min(26, W / 40))}px ${T.display}`;
      g.fillText(p.result, rx + cw + 12, ry + 2);
      g.restore();
    }
    if (active !== shown && t >= START) {
      shown = active;
      const s = stages[active];
      c.caption.textContent = `${String(active + 1).padStart(2, '0')} ${s.name}${s.note ? ` · ${s.note}` : ''}`;
      c.log(s.name, s.note ?? `stage ${active + 1} of ${n}`);
    }
  };
  return run(c, D, frame, c.replay ? 2 : 1).then(() => { c.caption.textContent = `200 ${c.path}`; });
};
