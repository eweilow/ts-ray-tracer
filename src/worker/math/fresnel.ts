export function fresnel(
  gloss: number,
  diffuseLighting: number[],
  colA: number[],
  colB: number[],
  dot: number,
  minColA: number = 0
): number[] {
  dot = dot * gloss + (1 - gloss);
  return [
    dot * colA[0] * diffuseLighting[0] + (1 - dot) * colB[0],
    dot * colA[1] * diffuseLighting[1] + (1 - dot) * colB[1],
    dot * colA[2] * diffuseLighting[2] + (1 - dot) * colB[2]
  ];
}
