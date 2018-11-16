import { primitives } from "../scene";
import { reflect } from "../math/reflect";
import { perturbate } from "../math/perturbate";

const maxDepth: number = 16;
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

const MaxDiffuseTraces = 4;
const MaxDiffuseBranching = 8;
const MAX = Number.MAX_SAFE_INTEGER;
function intersect(
  rayData: Float32Array,
  currentRay: number,
  diffuseTracesRun: number
) {
  rayData[currentRay * RayStride + RayData.Dist] = MAX;
  for (const primitive of primitives) {
    primitive.intersect(rayData, currentRay);
  }

  if (
    currentRay < maxDepth &&
    rayData[currentRay * RayStride + RayData.Dist] < MAX
  ) {
    const refl = rayData[currentRay * RayStride + RayData.Reflectivity];
    const diff = rayData[currentRay * RayStride + RayData.Diffuse];

    const curr = currentRay * RayStride;
    const next = (currentRay + 1) * RayStride;
    if (refl > 0) {
      let r = 0,
        g = 0,
        b = 0;
      reflect(rayData, currentRay + 1);
      intersect(rayData, currentRay + 1, diffuseTracesRun);
      r = rayData[next + RayData.R];
      g = rayData[next + RayData.G];
      b = rayData[next + RayData.B];
      rayData[curr + RayData.R] =
        rayData[curr + RayData.R] * (1 - refl) + r * refl;
      rayData[curr + RayData.G] =
        rayData[curr + RayData.G] * (1 - refl) + g * refl;
      rayData[curr + RayData.B] =
        rayData[curr + RayData.B] * (1 - refl) + b * refl;
    }

    if (diff > 0) {
      if (diffuseTracesRun <= MaxDiffuseTraces) {
        const N = MaxDiffuseBranching;

        let r = 0,
          g = 0,
          b = 0;
        for (let i = 0; i < N; i++) {
          perturbate(rayData, currentRay + 1, i === 0);
          intersect(rayData, currentRay + 1, diffuseTracesRun + 1);
          r += rayData[next + RayData.R] / N;
          g += rayData[next + RayData.G] / N;
          b += rayData[next + RayData.B] / N;
        }

        rayData[currentRay * RayStride + RayData.R] *= r;
        rayData[currentRay * RayStride + RayData.G] *= g;
        rayData[currentRay * RayStride + RayData.B] *= b;
      }
    }
  } else {
    // Render sky

    rayData[currentRay * RayStride + RayData.R] =
      0.4 * (rayData[currentRay * RayStride + RayData.DZ] * 0.8 + 0.2);
    rayData[currentRay * RayStride + RayData.G] =
      0.8 * (rayData[currentRay * RayStride + RayData.DZ] * 0.8 + 0.2);
    rayData[currentRay * RayStride + RayData.B] =
      1 * (rayData[currentRay * RayStride + RayData.DZ] * 0.8 + 0.2);
  }
}
//type Ray = [number, number, number, number, number, number];
export function beginTrace(data: Float32Array) {
  //data.fill(Math.sin(data[RayData.DX]) * 0.5 + 0.5);
  intersect(rayData, 0, 0);
}
