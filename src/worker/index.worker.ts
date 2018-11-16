import { ctx } from "./context";
import { Projector } from "./projector";
import { setRandomNumbers } from "./random";
import { beginTrace, rayData, RayData, RayStride, printRay } from "./tracing";

/*
class Ray {
  static intersectSphere(raydata: number[], stride: number): number[] {
    const intersectedSpheres = spheres
      .map(el => el.intersect(raydata, stride))
      .filter(el => el !== null);
    if (intersectedSpheres.length === 0) return null;

    intersectedSpheres.sort((a, b) => a[0] - b[0]);
    return intersectedSpheres[0];
  }

  static diffuseTrace(
    inflectionPoint: number[],
    inflectionStride: number,
    maxSteps: number,
    runSteps: number = 0
  ): number[] {
    if (runSteps >= maxSteps) return [0, 0, 0];

    const collected = [0, 0, 0];
    const steps = runSteps === 0 ? 250 : Math.max(1, 15 - runSteps * 5);

    for (let i = 0; i < steps; i++) {
      const perturbated = perturbate(inflectionPoint, inflectionStride, i * 14);
      const planeIntersection = plane.intersect(perturbated, 0);
      const sphereIntersection = Ray.intersectSphere(perturbated, 0);

      if (
        planeIntersection !== null &&
        (sphereIntersection === null ||
          sphereIntersection[0] > planeIntersection[0])
      ) {
        const diffuse = Ray.trace(planeIntersection, 1, maxSteps, 0, false);
        collected[0] += diffuse[0];
        collected[1] += diffuse[1];
        collected[2] += diffuse[2];
      }
      if (
        sphereIntersection !== null &&
        (planeIntersection === null ||
          planeIntersection[0] > sphereIntersection[0])
      ) {
        const diffuse = Ray.trace(sphereIntersection, 1, maxSteps, 0, false);
        collected[0] += diffuse[0] + sphereIntersection[7];
        collected[1] += diffuse[1] + sphereIntersection[7];
        collected[2] += diffuse[2] + sphereIntersection[7];
      }
      if (planeIntersection === null && sphereIntersection === null) {
        const diffuse = sky(inflectionPoint, inflectionStride);
        collected[0] += diffuse[0];
        collected[1] += diffuse[1];
        collected[2] += diffuse[2];
      }
    }
    return [collected[0] / steps, collected[1] / steps, collected[2] / steps];
  }

  static trace(
    raydata: number[],
    stride: number,
    maxSteps: number,
    runSteps: number = 0,
    diffusePass: boolean = true
  ): number[] {
    if (runSteps >= maxSteps) return sky(raydata, stride);

    const planeIntersection = plane.intersect(raydata, stride);
    const sphereIntersection = Ray.intersectSphere(raydata, stride);

    if (
      planeIntersection !== null &&
      (sphereIntersection === null ||
        sphereIntersection[0] > planeIntersection[0])
    ) {
      const dotProduct = Math.abs(dot(raydata, 3, planeIntersection, 4));

      const checkers = Textures.checkers.get(
        planeIntersection[1],
        planeIntersection[2]
      );
      const diffuseLighting = diffusePass
        ? Ray.diffuseTrace(planeIntersection, 1, maxSteps, runSteps + 1)
        : [0, 0, 0];

      const traced = Ray.trace(
        reflect(raydata, 3, planeIntersection, 1),
        0,
        maxSteps,
        runSteps + 1,
        diffusePass
      );

      return fresnel(
        0.2 * checkers[0],
        diffuseLighting,
        checkers,
        traced,
        dotProduct
      );
    }

    if (
      sphereIntersection !== null &&
      (planeIntersection === null ||
        planeIntersection[0] > sphereIntersection[0])
    ) {
      const dotProduct = Math.abs(dot(raydata, 3, sphereIntersection, 4));
      const diffuse = [1, 0, 0];
      const checkers = Textures.checkers.get(
        sphereIntersection[2] * 4,
        sphereIntersection[3] * 4
      );

      const reflected = reflect(raydata, 3, sphereIntersection, 1);
      const diffuseLighting = diffusePass
        ? Ray.diffuseTrace(sphereIntersection, 1, maxSteps, runSteps + 1)
        : [0, 0, 0];

      const traced = Ray.trace(
        reflected,
        0,
        maxSteps,
        runSteps + 1,
        diffusePass
      );

      return fresnel(
        0.1 * checkers[0],
        diffuseLighting,
        diffuse,
        traced,
        dotProduct
      ).map(el => el + sphereIntersection[7]);
    }

    return sky(raydata, stride);
  }
}
*/

/*

function hypothetical_sky(
  rayData: Float32Array,
  positionIndex: number,
  directionIndex: number
): Color {
  return [0, 0, 0];
}

const hypothetical_intersection_data: Primitive[] = [];
function hypothetical_intersection_finder(
  intersectionData: Primitive[],
  rayData: Float32Array,
  positionIndex: number,
  directionIndex: number
): number {
  return 0;
}

function hypothetical_tracer(
  rayData: Float32Array,
  positionIndex: number,
  directionIndex: number
): Color {
  const closest = hypothetical_intersection_finder(
    hypothetical_intersection_data,
    rayData,
    positionIndex,
    directionIndex
  );
  if (closest < 0) {
    return hypothetical_sky();
  }
}

type Color = [number, number, number];
type Vector = [number, number, number];
type SourceRay = {
  from: Vector;
  towards: Vector;
};

function stackTracer(): Color {
  const maxBounces = 5;
  const data = new Float32Array(3 + maxBounces * (3 + 3));
  hypothetical_tracer(data, 3, 6);
  return [data[0], data[1], data[2]];
}
*/

const projector = new Projector(90, 0, 0);

function renderPixel(
  imageData: Uint8ClampedArray,
  rayData: Float32Array,
  width: number,
  height: number,
  cellX: number,
  cellY: number,
  pixelX: number,
  pixelY: number,
  index: number
) {
  rayData.fill(0);
  projector.project(rayData, 0, pixelX, pixelY, width, height);
  beginTrace(rayData);
}
function render(e) {
  let [rnd, img, cx, cy, cellSize, width, height, time] = e.data;
  setRandomNumbers(rnd);
  const imageData = img as Uint8ClampedArray;

  let lastProgress = Date.now();

  for (let x = 0; x < cellSize; x++) {
    const px = cx + x;

    if (Date.now() - lastProgress > 10) {
      lastProgress = Date.now();
      ctx.postMessage({
        type: "progress",
        progress: x / cellSize
      });
    }
    for (let y = 0; y < cellSize; y++) {
      const py = cy + y;

      const i = y * cellSize + x;

      renderPixel(imageData, rayData, width, height, x, y, px, py, i);
      // const color = Ray.trace(raydata, stride, 64, 0);

      if (false) {
        const offset = 0;
        const f = Math.sqrt(rayData[RayStride * offset + RayData.Dist]);
        const depth = f / 30;
        imageData[i * 4 + 0] = Math.floor(depth * 255);
        imageData[i * 4 + 1] = Math.floor(depth * 255);
        imageData[i * 4 + 2] = Math.floor(depth * 255);
        imageData[i * 4 + 3] = 255;
      } else {
        imageData[i * 4 + 0] = Math.floor(
          rayData[RayStride * 0 + RayData.R] * 255
        );
        imageData[i * 4 + 1] = Math.floor(
          rayData[RayStride * 0 + RayData.G] * 255
        );
        imageData[i * 4 + 2] = Math.floor(
          rayData[RayStride * 0 + RayData.B] * 255
        );
        imageData[i * 4 + 3] = 255;
      }
    }
  }
  ctx.postMessage({ type: "done", imageData });
}
ctx.addEventListener("message", render);
