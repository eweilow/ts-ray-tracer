import { Primitive } from "./base";
import { RayData, RayStride } from "../tracing";

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

  intersect(rayData: Float32Array, currentRay: number) {
    const r = this.radius;
    const sx = this.x;
    const sy = this.y;
    const sz = this.z;

    const x = rayData[currentRay * RayStride + RayData.X];
    const y = rayData[currentRay * RayStride + RayData.Y];
    const z = rayData[currentRay * RayStride + RayData.Z];

    const dx = rayData[currentRay * RayStride + RayData.DX];
    const dy = rayData[currentRay * RayStride + RayData.DY];
    const dz = rayData[currentRay * RayStride + RayData.DZ];

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
      const dLen = Math.sqrt(dLength);

      const incidentX = sx + hx - (dx * t) / dLen;
      const incidentY = sy + hy - (dy * t) / dLen;
      const incidentZ = sz + hz - (dz * t) / dLen;

      let rx = incidentX - sx;
      let ry = incidentY - sy;
      let rz = incidentZ - sz;

      const squareDistance =
        Math.pow(incidentX - x, 2) +
        Math.pow(incidentY - y, 2) +
        Math.pow(incidentZ - z, 2);

      const rLength = Math.sqrt(rx * rx + ry * ry + rz * rz);
      rx /= rLength;
      ry /= rLength;
      rz /= rLength;

      if (squareDistance < rayData[currentRay * RayStride + RayData.Dist]) {
        rayData[(currentRay + 1) * RayStride + RayData.X] = incidentX;
        rayData[(currentRay + 1) * RayStride + RayData.Y] = incidentY;
        rayData[(currentRay + 1) * RayStride + RayData.Z] = incidentZ;
        rayData[(currentRay + 1) * RayStride + RayData.NX] = rx;
        rayData[(currentRay + 1) * RayStride + RayData.NY] = ry;
        rayData[(currentRay + 1) * RayStride + RayData.NZ] = rz;
        rayData[currentRay * RayStride + RayData.R] = 0;
        rayData[currentRay * RayStride + RayData.G] = 0;
        rayData[currentRay * RayStride + RayData.B] = 1;
        rayData[currentRay * RayStride + RayData.Reflectivity] = 0.8;
        rayData[currentRay * RayStride + RayData.Diffuse] = 0;
        rayData[currentRay * RayStride + RayData.Dist] = squareDistance;
      }
    }
  }
}
