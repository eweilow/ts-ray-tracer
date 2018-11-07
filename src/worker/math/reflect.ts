import { dot } from "./dot";

export function reflect(
  raydata: number[],
  directionStride: number,
  inflectionPoint: number[],
  inflectionStride: number
): number[] {
  const reflect = dot(raydata, 3, inflectionPoint, inflectionStride + 3);

  let rx = raydata[3] - 2 * reflect * inflectionPoint[inflectionStride + 3];
  let ry = raydata[4] - 2 * reflect * inflectionPoint[inflectionStride + 4];
  let rz = raydata[5] - 2 * reflect * inflectionPoint[inflectionStride + 5];
  const rLength = Math.sqrt(rx * rx + ry * ry + rz * rz);
  rx /= rLength;
  ry /= rLength;
  rz /= rLength;

  return [
    inflectionPoint[inflectionStride + 0] + rx * 0.001,
    inflectionPoint[inflectionStride + 1] + ry * 0.001,
    inflectionPoint[inflectionStride + 2] + rz * 0.001,
    rx,
    ry,
    rz
  ];
}
