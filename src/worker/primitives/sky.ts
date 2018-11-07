import { dot } from "../math/dot";

export function sky(raydata: number[], stride: number): number[] {
  const brightness = 1;

  const dotProduct = Math.max(0, dot([0, 0, 1], 0, raydata, stride + 3));

  const top = Math.pow(Math.max(0, dotProduct), 2);
  return [
    brightness * 0.15 * (1 - top) + brightness * (179 / 255) * top,
    brightness * (90 / 255) * (1 - top) + brightness * (230 / 255) * top,
    brightness * (135 / 255) * (1 - top) + brightness * 1.0 * top
  ];
}
