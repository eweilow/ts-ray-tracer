import { Primitive } from "./primitives/base";
import { Sphere } from "./primitives/sphere";
import { Plane } from "./primitives/plane";

const plane = new Plane(-3);
const spheres = [
  new Sphere(13, 0, 0, 5, 0),
  new Sphere(13, -7, -2, 0.5, 1),
  new Sphere(13, -5, -2, 0.25, 1)
];

export const primitives: Primitive[] = [plane, ...spheres];
