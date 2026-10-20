// The transition scenes, by name. A page's transition names one: { scene: 'pipeline', ... }.
// To add your own, write a function of type Scene (see util.ts and the README's "Your own scene"),
// then list it here. An unknown name falls back to opening the page with no scene.
import type { Scene } from './util';
import { type } from './type';
import { pipeline } from './pipeline';

export const scenes: Record<string, Scene> = {
  type,
  pipeline,
};
