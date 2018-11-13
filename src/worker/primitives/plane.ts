import { Primitive } from "./base";
import { RayData, RayStride } from "../tracing";
import { Textures } from "../textures";

export class Plane extends Primitive {
  constructor(public readonly level: number) {
    super();
  }

  intersect(rayData: Float32Array, currentRay: number) {
    const pz = this.level;

    const x = rayData[currentRay * RayStride + RayData.X];
    const y = rayData[currentRay * RayStride + RayData.Y];
    const z = rayData[currentRay * RayStride + RayData.Z];
    const dx = rayData[currentRay * RayStride + RayData.DX];
    const dy = rayData[currentRay * RayStride + RayData.DY];
    const dz = rayData[currentRay * RayStride + RayData.DZ];

    const f = (pz - z) / dz;

    if (f >= 0) {
      const incidentX = x + f * dx;
      const incidentY = y + f * dy;
      const incidentZ = this.level + 0.01;

      const squareDistance =
        Math.pow(incidentX - x, 2) +
        Math.pow(incidentY - y, 2) +
        Math.pow(incidentZ - z, 2);

      if (squareDistance < rayData[currentRay * RayStride + RayData.Dist]) {
        rayData[(currentRay + 1) * RayStride + RayData.X] = incidentX;
        rayData[(currentRay + 1) * RayStride + RayData.Y] = incidentY;
        rayData[(currentRay + 1) * RayStride + RayData.Z] = incidentZ;
        rayData[(currentRay + 1) * RayStride + RayData.NX] = 0;
        rayData[(currentRay + 1) * RayStride + RayData.NY] = 0;
        rayData[(currentRay + 1) * RayStride + RayData.NZ] = 1;
        Textures.checkers.assign(
          rayData,
          currentRay * RayStride + RayData.R,
          incidentX,
          incidentY
        );

        rayData[currentRay * RayStride + RayData.Reflectivity] = 0;
        rayData[currentRay * RayStride + RayData.Diffuse] = 0.5;
        rayData[currentRay * RayStride + RayData.Dist] = squareDistance;
      }
    }
  }
}
