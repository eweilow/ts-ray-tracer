import { Primitive } from "./base";

export class Sphere extends Primitive {
  constructor(
    public readonly x: number,
    public readonly y: number,
    public readonly z: number,
    public readonly radius: number,
    public readonly brightness: number
  ) {
    super();
  }

  intersect(raydata: number[], stride: number): number[] {
    const r = this.radius;
    const sx = this.x;
    const sy = this.y;
    const sz = this.z;

    const x = raydata[stride + 0];
    const y = raydata[stride + 1];
    const z = raydata[stride + 2];

    const dx = raydata[stride + 3];
    const dy = raydata[stride + 4];
    const dz = raydata[stride + 5];

    const distX = sx - x;
    const distY = sy - y;
    const distZ = sz - z;

    const dLength = dx * dx + dy * dy + dz * dz;

    const projDot = (distX * dx + distY * dy + distZ * dz) / dLength;

    if (projDot < 0) return null;

    const projLx = dx * projDot;
    const projLy = dy * projDot;
    const projLz = dz * projDot;

    const hx = projLx - distX;
    const hy = projLy - distY;
    const hz = projLz - distZ;

    const hSquare = hx * hx + hy * hy + hz * hz;

    if (hSquare <= r * r) {
      const tSquare = r * r - hSquare;
      const t = Math.sqrt(tSquare);
      const h = Math.sqrt(hSquare);

      const ix = sx + hx - (dx * t) / Math.sqrt(dLength);
      const iy = sy + hy - (dy * t) / Math.sqrt(dLength);
      const iz = sz + hz - (dz * t) / Math.sqrt(dLength);

      let rx = ix - sx;
      let ry = iy - sy;
      let rz = iz - sz;

      const rLength = Math.sqrt(rx * rx + ry * ry + rz * rz);
      rx /= rLength;
      ry /= rLength;
      rz /= rLength;
      return [
        (ix - x) * (ix - x) + (iy - y) * (iy - y) + (iz - z) * (iz - z),
        ix + rx * 0.001,
        iy + ry * 0.001,
        iz + rz * 0.001,
        rx,
        ry,
        rz,
        this.brightness
      ];
    }

    return null;
  }
}
