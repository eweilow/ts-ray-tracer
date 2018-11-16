import { getRandomNumbers } from "../random";
import { RayStride, RayData } from "../tracing";

const products = new Float32Array(9);
const basis = new Float32Array(9);
const unit = new Float32Array([
  1,
  0,
  0,
  //
  0,
  1,
  0,
  //,
  0,
  0,
  1
]);
function normalize(into: Float32Array, index: number) {
  const r = Math.sqrt(
    into[index] * into[index] +
      into[index + 1] * into[index + 1] +
      into[index + 2] * into[index + 2]
  );

  into[index] /= r;
  into[index + 1] /= r;
  into[index + 2] /= r;
}

function cross(
  into: Float32Array,
  index: number,
  leftData: Float32Array,
  left: number,
  rightData: Float32Array,
  right: number
) {
  into[index] =
    leftData[left + 1] * rightData[right + 2] -
    leftData[left + 2] * rightData[right + 1];
  into[index + 1] =
    leftData[left + 2] * rightData[right + 0] -
    leftData[left + 0] * rightData[right + 2];
  into[index + 2] =
    leftData[left + 0] * rightData[right + 1] -
    leftData[left + 1] * rightData[right + 0];
}

function add(
  leftData: Float32Array,
  leftIndex: number,
  rightData: Float32Array,
  rightIndex: number,
  scalarFactor: number = 1
) {
  leftData[leftIndex] += rightData[rightIndex] * scalarFactor;
  leftData[leftIndex + 1] += rightData[rightIndex + 1] * scalarFactor;
  leftData[leftIndex + 2] += rightData[rightIndex + 2] * scalarFactor;
}

export function perturbate(
  rayData: Float32Array,
  currentRay: number,
  calculateBasis: boolean = true
) {
  if (calculateBasis) {
    cross(products, 0, unit, 0, rayData, currentRay * RayStride + RayData.NX);
    cross(products, 3, unit, 3, rayData, currentRay * RayStride + RayData.NX);
    cross(products, 6, unit, 6, rayData, currentRay * RayStride + RayData.NX);

    basis[0] = products[0] + products[3] + products[6];
    basis[1] = products[1] + products[4] + products[7];
    basis[2] = products[2] + products[5] + products[8];
    normalize(basis, 0);
    basis[6] = rayData[currentRay * RayStride + RayData.NX];
    basis[7] = rayData[currentRay * RayStride + RayData.NY];
    basis[8] = rayData[currentRay * RayStride + RayData.NZ];
    cross(basis, 3, basis, 0, basis, 6);
  }

  const rnd = Math.random() * Math.PI * 2;

  const x = Math.cos(rnd) * 0.5;
  const y = Math.sin(rnd) * 0.5;

  const i = currentRay * RayStride + RayData.DX;
  add(rayData, i, basis, 0, x);
  add(rayData, i, basis, 3, y);
  add(rayData, i, basis, 6, 1);
  normalize(rayData, i);
}
