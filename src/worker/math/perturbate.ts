import { getRandomNumbers } from "../random";
import { dot } from "./dot";

export function perturbate(
  inflectionPoint: number[],
  inflectionStride: number,
  seed: number = 0
): number[] {
  let rx;
  let ry;
  let rz;

  const directional = 0;

  const randomNumbers = getRandomNumbers();

  let steps = 0;
  do {
    rx =
      randomNumbers[(seed * (steps * 297 + seed)) % randomNumbers.length] * 2 -
      1;
    ry =
      randomNumbers[(seed * (steps * 7 + seed + 1)) % randomNumbers.length] *
        2 -
      1;
    rz =
      randomNumbers[(seed * (steps * 19 + seed + 2)) % randomNumbers.length] *
        2 -
      1;
  } while (
    ++steps <= 5 &&
    dot(inflectionPoint, inflectionStride + 3, [rx, ry, rz], 0) <= 0
  );

  rx = inflectionPoint[inflectionStride + 3] + rx * (1 - directional);
  ry = inflectionPoint[inflectionStride + 4] + ry * (1 - directional);
  rz = inflectionPoint[inflectionStride + 5] + rz * (1 - directional);

  const rLength = Math.sqrt(rx * rx + ry * ry + rz * rz);
  rx /= rLength;
  ry /= rLength;
  rz /= rLength;
  return [
    inflectionPoint[inflectionStride + 0],
    inflectionPoint[inflectionStride + 1],
    inflectionPoint[inflectionStride + 2],
    rx,
    ry,
    rz
  ];
}
