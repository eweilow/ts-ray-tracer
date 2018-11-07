export function dot(
  vectorA: number[],
  strideA: number,
  vectorB: number[],
  strideB: number
) {
  return (
    vectorA[strideA + 0] * vectorB[strideB + 0] +
    vectorA[strideA + 1] * vectorB[strideB + 1] +
    vectorA[strideA + 2] * vectorB[strideB + 2]
  );
}
