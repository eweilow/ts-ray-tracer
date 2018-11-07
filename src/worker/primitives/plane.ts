import { Primitive } from "./base";

export class Plane extends Primitive {
  constructor(public readonly level: number) {
    super();
  }

  intersect(raydata: number[], stride: number): number[] {
    const pz = this.level;

    const x = raydata[stride + 0];
    const y = raydata[stride + 1];
    const z = raydata[stride + 2];
    const dx = raydata[stride + 3];
    const dy = raydata[stride + 4];
    const dz = raydata[stride + 5];

    const f = (pz - z) / dz;

    if (f >= 0) {
      const ix = x + f * dx;
      const iy = y + f * dy;
      const iz = this.level;
      return [
        (ix - x) * (ix - x) + (iy - y) * (iy - y) + (iz - z) * (iz - z),
        ix,
        iy,
        iz + 0.001,
        0,
        0,
        1
      ];
    }
    return null;
  }
}
