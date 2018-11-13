import { primitives } from "../scene";
import { reflect } from "../math/reflect";

const maxDepth: number = 1024;
const BOUNCE_ELEMENTS = 15; // x,y,z + dx,dy,dz + r,g,b

export const RayStride = BOUNCE_ELEMENTS;

/*
 * X: Current ray origin X
 * Y: Current ray origin Y
 * Z: Current ray origin Z
 * NX: Current ray incident normal
 * NY: Current ray incident normal
 * NZ: Current ray incident normal
 * DX: Current ray incoming direction
 * DY: Current ray incoming direction
 * DZ: Current ray incoming direction
 * R: Current ray collected color
 * G: Current ray collected color
 * B: Current ray collected color
 */
export enum RayData {
  X = 0,
  Y = 1,
  Z = 2,
  NX = 3,
  NY = 4,
  NZ = 5,
  DX = 6,
  DY = 7,
  DZ = 8,
  R = 9,
  G = 10,
  B = 11,
  Dist = 12,
  Reflectivity = 13,
  Diffuse = 14
}

export const rayData = new Float32Array(maxDepth * BOUNCE_ELEMENTS);

export function printRay(rayData: Float32Array, rayNumber: number) {
  return [
    "i: " + rayNumber,
    "x: " + rayData[rayNumber * RayStride + RayData.X].toFixed(2).padStart(6),
    "y: " + rayData[rayNumber * RayStride + RayData.Y].toFixed(2).padStart(6),
    "z: " + rayData[rayNumber * RayStride + RayData.Z].toFixed(2).padStart(6),
    "dx: " + rayData[rayNumber * RayStride + RayData.DX].toFixed(2).padStart(6),
    "dy: " + rayData[rayNumber * RayStride + RayData.DY].toFixed(2).padStart(6),
    "dz: " + rayData[rayNumber * RayStride + RayData.DZ].toFixed(2).padStart(6),
    "nx: " + rayData[rayNumber * RayStride + RayData.NX].toFixed(2).padStart(6),
    "ny: " + rayData[rayNumber * RayStride + RayData.NY].toFixed(2).padStart(6),
    "nz: " + rayData[rayNumber * RayStride + RayData.NZ].toFixed(2).padStart(6),
    "d: " + rayData[rayNumber * RayStride + RayData.Dist].toFixed(2).padStart(6)
  ].join(", ");
}

const MAX = Number.MAX_SAFE_INTEGER;
function intersect(rayData: Float32Array, currentRay: number) {
  rayData[currentRay * RayStride + RayData.Dist] = MAX;
  for (const primitive of primitives) {
    primitive.intersect(rayData, currentRay);
  }

  if (
    currentRay < maxDepth &&
    rayData[currentRay * RayStride + RayData.Dist] < MAX
  ) {
    const refl = rayData[currentRay * RayStride + RayData.Reflectivity];
    if (refl > 0) {
      reflect(rayData, currentRay + 1);
      intersect(rayData, currentRay + 1);

      const curr = currentRay * RayStride;
      const next = (currentRay + 1) * RayStride;
      rayData[curr + RayData.R] =
        rayData[curr + RayData.R] * (1 - refl) +
        rayData[next + RayData.R] * refl;
      rayData[curr + RayData.G] =
        rayData[curr + RayData.G] * (1 - refl) +
        rayData[next + RayData.G] * refl;
      rayData[curr + RayData.B] =
        rayData[curr + RayData.B] * (1 - refl) +
        rayData[next + RayData.B] * refl;
    } else {
    }
  } else {
    // Render sky
    rayData[currentRay * RayStride + RayData.R] = 0;
    rayData[currentRay * RayStride + RayData.G] = 0;
    rayData[currentRay * RayStride + RayData.B] = 0.5;
  }
}
//type Ray = [number, number, number, number, number, number];
export function beginTrace(data: Float32Array) {
  //data.fill(Math.sin(data[RayData.DX]) * 0.5 + 0.5);
  intersect(rayData, 0);
}
