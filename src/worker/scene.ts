import { Primitive } from "./primitives/base";
import { Sphere } from "./primitives/sphere";
import { Plane } from "./primitives/plane";

const plane = new Plane(-3);
const spheres = [
  new Sphere(10, 0, 0, 4, 0, 1, 0, 1),
  new Sphere(-5, 3, 0, 3, 0, 0, 1, 0),
  new Sphere(8, -7, -1.5, 1, 1, 0, 0, 1),
  new Sphere(8, -5, -2, 0.25, 1, 1, 0, 0)
];

export const primitives: Primitive[] = [plane, ...spheres];
