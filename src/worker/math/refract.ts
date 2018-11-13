import { dot } from "./dot";

export function refract(
  raydata: number[],
  directionStride: number,
  inflectionPoint: number[],
  inflectionStride: number
): number[] {
  const reflect = -dot(raydata, 3, inflectionPoint, inflectionStride + 3);

  const eta = 1.45;

  const k = 1 - eta * eta * (1 - reflect * reflect);
  if (k < 0) return raydata;

  let rx =
    eta * raydata[3] -
    (eta * reflect + Math.sqrt(k)) * inflectionPoint[inflectionStride + 3];
  let ry =
    eta * raydata[4] -
    (eta * reflect + Math.sqrt(k)) * inflectionPoint[inflectionStride + 4];
  let rz =
    eta * raydata[5] -
    (eta * reflect + Math.sqrt(k)) * inflectionPoint[inflectionStride + 5];
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
