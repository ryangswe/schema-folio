// Helpers shared by the scenes.
import type { RouteInfo, Transition } from '../../lib/types';

export const ease = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
export const clamp = (k: number) => Math.max(0, Math.min(1, k));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const esc = (s: string) => s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c] as string);

/** The page's color and font tokens, read at the moment a scene starts (so both modes work). */
export function tokens() {
  const css = getComputedStyle(document.documentElement);
  const v = (k: string) => css.getPropertyValue(k).trim();
  return { paper: v('--paper'), raised: v('--raised'), ink: v('--ink'), ink2: v('--ink-2'), rule: v('--rule'), mono: v('--f-mono'), display: v('--f-display') };
}

/** Everything a scene gets. Resolve the promise when the scene is done; the new page then shows. */
export interface SceneContext {
  /** The box that opened, full screen. */
  portal: HTMLElement;
  /** A canvas filling the box, sized in CSS pixels (already scaled for the screen). */
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  /** The heading block (tag, page name, an empty <pre class="script">). Fade it out to draw on the canvas. */
  heading: HTMLElement;
  /** The status line under the box. */
  caption: HTMLElement;
  path: string;
  route: RouteInfo;
  /** The page's transition, as written in the config or the front matter. */
  params: Transition;
  /** True when this scene already played this visit: play it faster. */
  replay: boolean;
  log: (kind: string, msg: string) => void;
  /** Calls `cb` when the visitor clicks or presses Esc, Enter or Space. Returns a function that stops listening. */
  onSkip: (cb: () => void) => () => void;
}

export type Scene = (ctx: SceneContext) => Promise<void>;

/** Runs `frame(t)` each animation frame until `duration` ms (or a skip), then resolves. */
export function run(c: SceneContext, duration: number, frame: (t: number) => void, speed = 1): Promise<void> {
  return new Promise((res) => {
    let done = false;
    const finish = () => { if (done) return; done = true; off(); frame(duration); setTimeout(res, 120); };
    const off = c.onSkip(finish);
    const s0 = performance.now();
    const loop = (now: number) => {
      if (done) return;
      const t = (now - s0) * speed;
      frame(Math.min(t, duration));
      if (t < duration) requestAnimationFrame(loop); else finish();
    };
    requestAnimationFrame(loop);
  });
}
