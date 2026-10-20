// The `type` scene: lines typed as in a terminal, under the page's name.
//   { scene: 'type', lines: [['cmd', 'ls ~/work'], ['out', 'a/  b/'], ['code', 'x = 1']] }
// 'cmd' lines get a "$ " prompt, 'code' lines are typed bare, 'out' lines appear whole.
import type { ScriptLine } from '../../lib/types';
import { esc, type Scene } from './util';

export const type: Scene = (c) => {
  const pre = c.heading.querySelector('.script') as HTMLElement;
  const lines = ((c.params as { lines?: ScriptLine[] }).lines ?? []);
  const speed = c.replay ? 2.5 : 1;
  const steps: { s: string; ms: number; p?: boolean }[] = [];
  lines.forEach(([kind, text], i) => {
    if (i) steps.push({ s: '\n', ms: 0 });
    if (kind === 'out') steps.push({ s: text, ms: 110, p: true });
    else {
      if (kind === 'cmd') steps.push({ s: '$ ', ms: 0, p: true });
      for (const ch of text) steps.push({ s: ch, ms: 7 });
    }
  });
  const at: number[] = [];
  let sum = 0;
  steps.forEach((st) => { sum += st.ms / speed; at.push(sum); });
  const render = (k: number) => {
    let html = '';
    for (let i = 0; i < k; i++) html += steps[i].p ? `<span class="p">${esc(steps[i].s)}</span>` : esc(steps[i].s);
    pre.innerHTML = html + '<span class="cur"></span>';
  };
  return new Promise((res) => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true; off(); render(steps.length);
      c.caption.textContent = `200 ${c.path}`;
      setTimeout(res, 160);
    };
    const off = c.onSkip(finish);
    const s0 = performance.now() + 300 / speed; // let the box open first
    const loop = (now: number) => {
      if (done) return;
      const t = now - s0;
      let k = 0;
      while (k < steps.length && at[k] <= t) k++;
      render(k);
      if (t < sum + 150) requestAnimationFrame(loop); else finish();
    };
    requestAnimationFrame(loop);
  });
};
