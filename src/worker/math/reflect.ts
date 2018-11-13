import { dot } from "./dot";
import { RayStride, RayData } from "../tracing";

export function reflect(rayData: Float32Array, rayNumber: number) {
  const dx = rayData[(rayNumber - 1) * RayStride + RayData.DX];
  const dy = rayData[(rayNumber - 1) * RayStride + RayData.DY];
  const dz = rayData[(rayNumber - 1) * RayStride + RayData.DZ];

  const nx = rayData[rayNumber * RayStride + RayData.NX];
  const ny = rayData[rayNumber * RayStride + RayData.NY];
  const nz = rayData[rayNumber * RayStride + RayData.NZ];

  const d_dot_n = dx * nx + dy * ny + dz * nz;

  rayData[rayNumber * RayStride + RayData.DX] = dx - 2 * d_dot_n * nx;
  rayData[rayNumber * RayStride + RayData.DY] = dy - 2 * d_dot_n * ny;
  rayData[rayNumber * RayStride + RayData.DZ] = dz - 2 * d_dot_n * nz;
}
